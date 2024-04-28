import puppeteer, { Page } from "puppeteer";
import { Homework } from "../types/Homework";
import { UserInfo } from "../types/UserInfo";
import { LoginData } from "../types/LoginData";

const CURRENT_PAGE = "https://ferrum.tecnologicocomfenalco.edu.co/ferrum/";
type FerrumPage = Page | undefined

export class FerrumUser {
	private loginData: LoginData
	private currentPage: FerrumPage
	studentCode: string

	constructor(loginData: LoginData) {
		this.loginData = loginData
	}

	/**
	 * Init the browser and Login in to the ferrum app.
	*/ 
	public async InitPage() {
		console.info("Inicializando Pagina")
		// Declaramos el buscador.
		let newBrowser = await puppeteer.launch({
			headless: true
		})
		// Abrimos una nueva pagina con el buscador.
		this.currentPage = await newBrowser.newPage()

		console.log("Pagina Declarada")
		console.log("Pagina: " + this.currentPage)


		//! Configuración
		const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
		await this.currentPage.setUserAgent(ua)
		await this.currentPage.setViewport({width: 1080, height: 1024});

		// Accedemos al método goto para abrir la pagina en nuestro buscador.
		await this.currentPage.goto(CURRENT_PAGE);

		try {
			// Iniciamos sesión.
			await this.currentPage.waitForSelector("#pre-login-form");
			await this.currentPage.type('[name="username"]', this.loginData.user);
			await this.currentPage.type('[name="password"]', this.loginData.password);
			await this.currentPage.click(".btn-login");

			const alertDanger = await this.currentPage.$('.alert-danger')
			if (alertDanger) {
				throw new Error("The user or password is incorrect.")
			}
		} catch (err) {
			throw err
		}
		console.log("Pagina Inicializada")


	}

	private async executePage(callback: () => void | Promise<any>): Promise<UserInfo | any> {
		try {
			if (this.currentPage != undefined) {
				const result = await callback()
				return result
			} else {
				throw new Error("The page is not define or not online.")
			}
		} catch (err) {
			throw err;
		}
	}

	/**
	 * Get all information about the user in the ferrum app.
	 * @returns All info about the user.
	*/
	public async getUserInfo(): Promise<UserInfo | any> {
		return await this.executePage(async () => {
			await this.currentPage.goto(CURRENT_PAGE + "user/profile.php");
			const userData = await this.currentPage.evaluate(() => {
				// Obtenemos los intereses del usuario.
				let interestsList: Array<string> = [];
				document.querySelector(".tag_list")?.querySelector(".inline-list")?.querySelectorAll("li").forEach((li) => {
					interestsList.push(li.innerText);
				});

				return {
					fullname: document.querySelector(".fullname")?.querySelector("span")?.innerText || "Vació",
					email: document.querySelector(".email")?.querySelector("dd")?.innerText || "Vació",
					city: document.querySelector(".city")?.querySelector("dd")?.innerText || "Vació",
					interests: interestsList,
					id: document.querySelector(".idnumber")?.querySelector("dd")?.innerText || "Vació",
				};
			});

			// Asignamos código de estudiante.
			this.studentCode = userData.id

			// Accedemos a la sección de carreras.
			await this.currentPage.click('[for="coursedetails"]');
			const coursesData = await this.currentPage.evaluate(() => {
				// Obtenemos sus carreras.
				let coursesList: Array<string> = [];
				let coursesElements = document.querySelector(".coursedetails")?.querySelectorAll("li")
				if (coursesElements) {
					// Removemos el primer elemento que es una cadena conjunta.
					const arrayCourses = Array.from(coursesElements)
					arrayCourses.slice(1).forEach((c) => {
						if (c?.innerText.includes("CLASE")) {
							coursesList.push(c.innerText);
						}
					})
				}
				return { courses: coursesList };
			});

			await this.currentPage.click('[for="more"]');
			const accessData = await this.currentPage.evaluate(() => {
				return {
					firstAccess: document.querySelector(".firstaccess")?.querySelector("dd")?.innerText || "",
					lastAccess: document.querySelector(".lastaccess")?.querySelector("dd")?.innerText || "",
				};
			});

			// Retornamos la información del usuario.
			return {
				...userData,
				...coursesData,
				...accessData
			}
		})
	}

	/**
	 * Get all information about homeworks from the user in the ferrum app.
	 * @returns Array of the homeworks
	*/
	public async getHomeworks(): Promise<Array<Homework>> {
		return await this.executePage(async () => {
			await this.currentPage.goto(CURRENT_PAGE + "calendar/view.php");
			const homeworkData = this.currentPage.evaluate(() => {
				const homeworks: Array<any> = []
				document.querySelectorAll(".event").forEach((e) => {

					function getContainerInformation(container: NodeListOf<Element>, isQuery: boolean, position: number, tag: string): string {
						return isQuery === false
						? container[position].querySelectorAll<HTMLDivElement>(tag)[1].innerText
						: container[container.length - 1].querySelector<HTMLDivElement>(tag).innerText
					}

					function optimizeText(text: string) {
						// Eliminar líneas en blanco adicionales
						text = text.replace(/^\s*[\r\n]/gm, '');
						// Reemplazar múltiples espacios en blanco por uno solo
						text = text.replace(/\s{2,}/g, ' ');
						return text;
					}

					// Esquema de la tarea.
					const homework: Homework = {
						title: "",
						course: "",
						sendDate: "",
						status: "",
						description: ""
					}

					// Obtenemos la información del contenedor de las tareas.
					const containerInfo = e.querySelector(".description").querySelectorAll(".row")
					homework.title = e.querySelector(".name").innerHTML
					homework.sendDate = getContainerInformation(containerInfo, false, 0, "div") //containerInfo[0].querySelectorAll("div")[1].innerText
					homework.status = getContainerInformation(containerInfo, false, 1, "div") //containerInfo[1].querySelectorAll("div")[1].innerText
					homework.course = getContainerInformation(containerInfo, true, 0, "a") //containerInfo[containerInfo.length - 1].querySelector("a").innerText
					homework.description = e.querySelector<HTMLDivElement>(".description-content")?.innerText

					//* Formateamos la descripción si existe.
					if (homework.description) {
						homework.description = optimizeText(homework.description)
					}
					homeworks.push(homework)
				})
				return homeworks
			})
			return homeworkData
		})
	}
}






