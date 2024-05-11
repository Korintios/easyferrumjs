import puppeteer, { Page } from "puppeteer";
import { Homework, TaskStatus } from "../types/Homework";
import { UserInfo } from "../types/UserInfo";
import { LoginData } from "../types/LoginData";

const CURRENT_PAGE = "https://ferrum.tecnologicocomfenalco.edu.co/ferrum/";
const HOMEWORK_PAGE = CURRENT_PAGE + "mod/assign/view.php?id="
const QUIZ_PAGE = CURRENT_PAGE + "mod/quiz/view.php?id="
type FerrumPage = Page | undefined

const DEFAULT_HOMEWORK: Homework = {
	title: "",
	type: "Tarea",
	course: "",
	taskScore: "",
	sendDate: "",
	timeLeft: "",
	statusSend: "Desconocido",
	lastModification: ""
}

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
		console.info("Iniciando Sesión...");
	
		try {
			const browser = await puppeteer.launch({ headless: true });
			const page = await browser.newPage();
	
			// Configuración de la página
			const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
			await page.setUserAgent(userAgent);
			await page.setViewport({ width: 1080, height: 1024 });
	
			// Navegar a la página de inicio
			await page.goto(CURRENT_PAGE);
	
			// Esperar hasta que aparezca el formulario de inicio de sesión
			await page.waitForSelector("#pre-login-form");
	
			// Iniciar sesión
			await page.type('[name="username"]', this.loginData.user);
			await page.type('[name="password"]', this.loginData.password);
			await page.click(".btn-login");
	
			// Verificar si hay un mensaje de error
			const alertDanger = await page.$('.alert-danger');
			if (alertDanger) {
				throw new Error("El usuario o la contraseña son incorrectos.");
			}

			// Asignamos la pagina dentro del atributo del objeto.
			this.currentPage = page
	
			// Cargar datos de usuario y tareas
			this.userInfo = await this.getUserInfo();
			const data = await this.getAllData();
			this.homeworks = data.homeworks;
			this.autoReviews = data.autoReviews;
	
			console.info("Sesión Establecida.");
		} catch (err) {
			console.error("Error al iniciar sesión:", err);
			throw err;
		}
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
				const interestsList = Array.from(document.querySelectorAll<HTMLDataListElement>(".tag_list .inline-list li")).map(li => li.innerText.trim());
				const fullname = (document.querySelector(".fullname span") as HTMLElement)?.innerText || "";
				const email = (document.querySelector(".email dd") as HTMLElement)?.innerText || "";
				const city = (document.querySelector(".city dd") as HTMLElement)?.innerText || "";
				const id = (document.querySelector(".idnumber dd") as HTMLElement)?.innerText || "";
	
				return { fullname, email, city, interests: interestsList, id };
			});
	
			this.studentCode = userData.id;
	
			await Promise.all([
				this.currentPage.click('[for="coursedetails"]'),
				this.currentPage.click('[for="more"]')
			]);
	
			const [coursesData, accessData] = await Promise.all([
				this.currentPage.evaluate(() => {
					const coursesList = Array.from(document.querySelectorAll<HTMLDataListElement>(".coursedetails li"))
						.slice(1)
						.filter(c => c.innerText.includes("CLASE"))
						.map(c => c.innerText);
	
					return { courses: coursesList };
				}),
				this.currentPage.evaluate(() => {
					const firstAccess = (document.querySelector(".firstaccess dd") as HTMLElement)?.innerText || "";
					const lastAccess = (document.querySelector(".lastaccess dd") as HTMLElement)?.innerText || "";
					
					return { firstAccess, lastAccess };
				})
			]);
	
			return { ...userData, ...coursesData, ...accessData };
		});
	}
	

	/**
	 * Get all information about homeworks from the user in the ferrum app.
	 * @returns Array of the homeworks
	*/
	private async getAllData(): Promise<{ homeworks: Homework[], autoReviews: Homework[] }> {
		return await this.executePage(async () => {
			await this.currentPage.goto(CURRENT_PAGE + "calendar/view.php");
			const { homeworks, autoReviews } = await this.currentPage.evaluate(() => {
				const homeworks: Homework[] = [];
				const autoReviews: Homework[] = [];
	
				document.querySelectorAll(".event").forEach((e) => {
					const title = e.querySelector(".name").innerHTML;
					const descriptionContent = e.querySelector<HTMLDivElement>(".description-content");
					const description = descriptionContent?.innerText.trim() || '';
	
					const containerInfo = e.querySelector(".description").querySelectorAll(".row");
	
					const sendDate = containerInfo[0].querySelectorAll("div")[1].innerText;
					const status = containerInfo[1].querySelectorAll("div")[1].innerText;
					const course = containerInfo[containerInfo.length - 1].querySelector("a").innerText;
					const id = e.querySelector<HTMLAreaElement>(".card-footer a")?.href.match(/\d+/g)?.join('');
	
					const homework: Homework = {
						title,
						course,
						sendDate,
						status,
						description,
						type: title.includes("Auto-Evaluación") ? "Auto Evaluación" : "Tarea",
						id: id || ""
					};
	
					if (homework.type === "Tarea") {
						homeworks.push(homework);
					} else {
						autoReviews.push(homework);
					}
				});
	
				return { homeworks, autoReviews };
			});
	
			return { homeworks, autoReviews };
		});
	}	

	/**
	 * 
	 * @param homeworks A homeworks array with additional data.
	 * @returns Array with the homeworks find.
	 */
	private async setStateOnHomeworks(): Promise<Array<Homework>> {
		return await this.executePage(async () => {
			// Filtramos las tareas y creamos un array donde Iran las mismas con su estado.
			const allTasks = this.homeworks.filter((task) => task.type === "Tarea");
			const allTasksWithStatus = [];
	
			for (const task of allTasks) {
				// Accedemos a la pagina de la tarea
				await this.currentPage.goto(HOMEWORK_PAGE + task.id);
				const updatedTask = await this.currentPage.evaluate((task) => {
					// Obtenemos los datos del contenedor entre muchos otros.
					const containerInfo = document.querySelectorAll<HTMLDivElement>(".generaltable tr");
					const statusSend = containerInfo[0].querySelector("td").innerText;
					task.statusSend = statusSend as TaskStatus
					task.taskScore = containerInfo[1].querySelector("td").innerText;
					task.timeLeft = containerInfo[3].querySelector("td").innerText;
					task.lastModification = containerInfo[4].querySelector("td").innerText;

					return task;
				}, task);
				// Agregamos la tarea al array con su estado.
				allTasksWithStatus.push(updatedTask);
			}
			return allTasksWithStatus;
		});
	}
	

	/**
	 * Get all homeworks in differents parametters.
	 * @param filter Filter depends the homeworks you will get.
	 * @returns 
	 */
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

	/**
	 * Return all Information about the homework with your id.
	 * @param id ID of the homework in the ferrum app.
	 * @returns Homework with all data.
	 */
	public async getHomeworkInfo(id: string): Promise<Homework> {
		// Accedemos a la pagina de la tarea.
		await this.currentPage.goto(HOMEWORK_PAGE + id);

		const homeworkData: Homework = await this.currentPage.evaluate((id, DEFAULT_HOMEWORK) => {

			const homework: Homework = {
				id: id,
				...DEFAULT_HOMEWORK
			}
			
			// Obtenemos los datos como el titulo, curso, etc.
			const mainHeading = document.querySelector<HTMLDivElement>("[role=main] h2");
			const breadcrumbElements = document.querySelectorAll<HTMLDivElement>(".breadcrumb li");
			const generalTableRows = document.querySelectorAll<HTMLDivElement>(".generaltable tr");

			if (mainHeading && breadcrumbElements.length >= 2 && generalTableRows.length >= 5) {
				homework.title = mainHeading.innerText;
				homework.course = breadcrumbElements[1].innerText;
				homework.taskScore = generalTableRows[1].querySelector("td").innerText;
				homework.sendDate = generalTableRows[2].querySelector("td").innerText;
				homework.timeLeft = generalTableRows[3].querySelector("td").innerText;
				homework.lastModification = generalTableRows[4].querySelector("td").innerText;
				const statusSend = generalTableRows[0].querySelector("td").innerText;
				homework.statusSend = statusSend as TaskStatus;
			}

			return homework
		}, id, DEFAULT_HOMEWORK);

		return homeworkData
	}

	/**
	 * Close the session of the user.
	 */
	public async closeSession() {
		console.log("Cerrando sesión...")
		this.loginData = null
		this.homeworks = []
		this.autoReviews = []
		this.userInfo = null
		this.studentCode = ""
		this.currentPage.close()
	}
}






