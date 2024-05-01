
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
        const userHomeworks = await ferrumUser.getUserInfo()
        console.log(userHomeworks)
    } catch (error) {
        console.error("Error in FerrumJS", error);
    }
}

fetchUserInfo()
