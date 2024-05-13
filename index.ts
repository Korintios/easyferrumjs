import { LoginData } from "./types/LoginData"
import { FerrumUser } from "./models/User"
import { configDotenv } from "dotenv"
configDotenv()

const newUser: LoginData = {
    user: process.env.FERRUM_USER,
    password: process.env.FERRUM_PASS
}

async function fetchUserInfo() {
    try {
        // Inicializamos
        const ferrumUser = new FerrumUser(newUser);
        await ferrumUser.InitPage();

        // Obtenemos información de Usuario.
        console.log(ferrumUser.userInfo)

        // Obtenemos las tareas parametrizadas a nuestras necesidades.
        console.log("Tareas")
        //const allTasksPending = await ferrumUser.getInfo("Task", "Pending")
        //const allTasksSend = await ferrumUser.getInfo("Task", "Send")
        const allTasks = await ferrumUser.getInfo("Task", "All")
        console.log(allTasks)

        console.log("Auto Evaluaciones")
        const allSelfEvaluation = await ferrumUser.getInfo("Self Evaluation", "Pending")
        console.log(allSelfEvaluation)

        // Obtenemos el estado de alguna tarea.
        const task = await ferrumUser.getHomeworkInfo("1415023")
        console.log(task)

        // Cerramos Sesión.
        await ferrumUser.closeSession()
        return
    } catch (error) {
        console.error("Error in FerrumJS", error);
    }
}

fetchUserInfo()
