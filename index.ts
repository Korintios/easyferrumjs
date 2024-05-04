
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
        //! Inicializamos
        const ferrumUser = new FerrumUser(newUser);
        await ferrumUser.InitPage();

        //! Obtenemos información de Usuario.
        console.log(ferrumUser.userInfo)

        //! Obtenemos las tareas parametrizadas a nuestras necesidades.
        console.log("Tareas")
        const allTasksPending = await ferrumUser.getHomeworks("Pending")
        const allTasksSend = await ferrumUser.getHomeworks("Send")
        const allTasks = await ferrumUser.getHomeworks("All")
        console.log(allTasks)
    } catch (error) {
        console.error("Error in FerrumJS", error);
    }
}

fetchUserInfo()
