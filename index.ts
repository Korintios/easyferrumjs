
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
        const ferrumUser = new FerrumUser(newUser);
        await ferrumUser.InitPage();
        console.log(ferrumUser.userInfo)
        console.log("Tareas")
        const allTasksPending = await ferrumUser.getHomeworks("Pending")
        const allTasksSend = await ferrumUser.getHomeworks("Send")
        const allTasks = await ferrumUser.getHomeworks("All")
        console.log(allTasks)
        console.log("Auto Evaluaciones")
        console.log(ferrumUser.autoReviews)
    } catch (error) {
        console.error("Error in FerrumJS", error);
    }
}

fetchUserInfo()
