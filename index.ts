import { LoginData } from "./types/LoginData"
import { FerrumUser } from "./utils/User"

const newUser: LoginData = {
    user: process.env.USERNAME,
    password: process.env.PASSWORD
}

async function fetchUserInfo() {
    try {
        const ferrumUser = new FerrumUser(newUser);
        await ferrumUser.InitPage();
        const userInfo = await ferrumUser.getUserInfo();
        console.log(userInfo)
    } catch (error) {
        console.error("Error al obtener la información del usuario:", error);
    }
}

fetchUserInfo()
