
import { LoginData } from "./types/LoginData"
import { FerrumUser } from "./utils/User"
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
        const userInfo = await ferrumUser.getUserInfo()
        const userHomeworks = await ferrumUser.getHomeworks()
        console.log(userInfo)
        console.log(ferrumUser.studentCode)
        console.log(userHomeworks)
    } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
    }
}

fetchUserInfo()
