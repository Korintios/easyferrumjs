import puppeteer, { Page } from "puppeteer";
import { Homework, TaskStatus } from "../types/Homework";
import { UserInfo } from "../types/UserInfo";
import { LoginData } from "../types/LoginData";
import { validateTaskStatus } from "../utils/validateTaskStatus";

const CURRENT_PAGE = "https://ferrum.tecnologicocomfenalco.edu.co/ferrum/";
const HOMEWORK_PAGE = CURRENT_PAGE + "mod/assign/view.php?id="
const QUIZ_PAGE = CURRENT_PAGE + "mod/quiz/view.php?id="
type FerrumPage = Page | undefined

export class FerrumUser {
	private loginData: LoginData
	private currentPage: FerrumPage
	studentCode: string
	userInfo: UserInfo
	private homeworks: Array<Homework>
	autoReviews: Array<Homework>

	constructor(loginData: LoginData) {
		this.loginData = loginData
	}

	/**
	 * Init the browser and Login in to the ferrum app.
	*/ 
	public async InitPage() {
		console.info("Iniciando Sesión...")
		// Declaramos el buscador.
		let newBrowser = await puppeteer.launch({
			headless: true
		})
		// Abrimos una nueva pagina con el buscador.
		this.currentPage = await newBrowser.newPage()

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

			//! Cargamos Datos de Usuario.
			console.log("Cargando Datos...")
			this.userInfo = await this.getUserInfo()
			const DATA = await this.getAllData()
			this.homeworks = DATA[0]
			this.autoReviews = DATA[1]
			console.log("Datos Cargados.")

		} catch (err) {
			throw err
		}
		console.info("Sesión Establecida.")
		
		


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
	private async getUserInfo(): Promise<UserInfo | any> {
		return await this.executePage(async () => {
			await this.currentPage.goto(CURRENT_PAGE + "user/profile.php");
			const userData = await this.currentPage.evaluate(() => {
				// Obtenemos los intereses del usuario.
				let interestsList: Array<string> = [];
				document.querySelectorAll<HTMLDataListElement>(".tag_list .inline-list li").forEach((li) => {
					interestsList.push(li.innerText);
				});

				return {
					fullname: document.querySelector<HTMLDivElement>(".fullname span").innerText || "",
					email: document.querySelector<HTMLDivElement>(".email dd").innerText || "",
					city: document.querySelector<HTMLDivElement>(".city dd").innerText || "",
					interests: interestsList,
					id: document.querySelector<HTMLDivElement>(".idnumber dd").innerText || "",  
				};
			});

			// Asignamos código de estudiante.
			this.studentCode = userData.id

			// Accedemos a la sección de carreras.
			await this.currentPage.click('[for="coursedetails"]');
			const coursesData = await this.currentPage.evaluate(() => {
				// Obtenemos sus carreras.
				let coursesList: Array<string> = [];
				let coursesElements = document.querySelectorAll<HTMLDataListElement>(".coursedetails li")
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
					firstAccess: document.querySelector<HTMLDivElement>(".firstaccess dd").innerText || "",
					lastAccess: document.querySelector<HTMLDivElement>(".lastaccess dd").innerText || "",
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
	private async getAllData(): Promise<Array<Homework[]>> {
		return await this.executePage(async () => {
			await this.currentPage.goto(CURRENT_PAGE + "calendar/view.php");
			const Data = this.currentPage.evaluate(() => {
				const homeworks: Array<Homework> = []
				const autoReviews: Array<Homework> = []
				document.querySelectorAll(".event").forEach((e) => {

					function optimizeText(text: string) {
						// Eliminar líneas en blanco adicionales
						text = text.replace(/^\s*[\r\n]/gm, '');
						// Reemplazar múltiples espacios en blanco por uno solo
						text = text.replace(/\s{2,}/g, ' ');
						return text;
					}

					function getContainerInformation(container: NodeListOf<Element>, isQuery: boolean, position: number, tag: string): string {
						return isQuery === false
						? container[position].querySelectorAll<HTMLDivElement>(tag)[1].innerText
						: container[container.length - 1].querySelector<HTMLDivElement>(tag).innerText
					}

					// Esquema de la tarea.
					const homework: Homework = {
						title: "",
						course: "",
						sendDate: "",
						status: "",
						description: "",
						type: "Tarea",
						id: ""
					}

					// Obtenemos la información del contenedor de las tareas.
					const containerInfo = e.querySelector(".description").querySelectorAll(".row")
					homework.title = e.querySelector(".name").innerHTML
					homework.sendDate = getContainerInformation(containerInfo, false, 0, "div") //containerInfo[0].querySelectorAll("div")[1].innerText
					homework.status = getContainerInformation(containerInfo, false, 1, "div") //containerInfo[1].querySelectorAll("div")[1].innerText
					homework.course = getContainerInformation(containerInfo, true, 0, "a") //containerInfo[containerInfo.length - 1].querySelector("a").innerText
					homework.description = e.querySelector<HTMLDivElement>(".description-content")?.innerText
					homework.id = e.querySelector<HTMLAreaElement>(".card-footer a")?.href

					//* Ajustamos la id para que solo sean los números.
					homework.id = homework.id.match(/\d+/g).join("");


					//* Aplicamos la tarea según su tipo.
					if (homework.title.includes("Auto-Evaluación")) {
						homework.type = "Auto Evaluación"
					}

					//* Formateamos la descripción si existe.
					if (homework.description) {
						homework.description = optimizeText(homework.description)
					}

					if (homework.type === "Tarea") {
						homeworks.push(homework)
					} else if (homework.type === "Auto Evaluación") {
						autoReviews.push(homework)
					}

				})
				return [homeworks, autoReviews]
			})
			return Data
		})
	}

	/**
	 * 
	 * @param homeworks A homeworks array with additional data.
	 * @returns 
	 */
	private async setStateOnHomeworks(): Promise<Array<Homework>> {
		return await this.executePage(async () => {
			const allTasks = this.homeworks.filter((task) => task.type === "Tarea");
			const allTasksWithStatus = [];
	
			for (const task of allTasks) {
				await this.currentPage.goto(HOMEWORK_PAGE + task.id);
				const updatedTask = await this.currentPage.evaluate((task) => {
					const containerInfo = document.querySelectorAll<HTMLDivElement>(".generaltable tr");
					const statusSend = containerInfo[0].querySelector("td").innerText;
					if (!statusSend) {
						task.statusSend = "Desconocido";
					} else {
						task.statusSend = statusSend as TaskStatus;
					}
					task.taskScore = containerInfo[1].querySelector("td").innerText;
					task.timeLeft = containerInfo[3].querySelector("td").innerText;
					task.lastModification = containerInfo[4].querySelector("td").innerText;

					return task;
				}, task);
				allTasksWithStatus.push(updatedTask);
			}
			return allTasksWithStatus;
		});
	}

	public async getHomeworks(filter: "All" | "Pending" | "Send"): Promise<Array<Homework>> {
		// Obtener todos los deberes con su estado actualizado
		const allHomeworksWithStatus = await this.setStateOnHomeworks();
		
		let filteredHomeworks: Array<Homework> = [];
	
		// Filtrar los deberes según el filtro especificado
		if (filter === "Pending") {
			// Filtrar deberes pendientes
			filteredHomeworks = allHomeworksWithStatus.filter(task => task.statusSend === "No entregado");
			return filteredHomeworks
		} else if (filter === "Send") {
			// Filtrar deberes enviados para calificar
			filteredHomeworks = allHomeworksWithStatus.filter(task => task.statusSend === "Enviado para calificar");
			return filteredHomeworks
		}

		return allHomeworksWithStatus
	}
	
}






