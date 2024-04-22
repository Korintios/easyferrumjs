# Easy Ferrum JS

<img src="banner.png">

Ferrum es una aplicación web de la universidad tecnológico comfenalco la cual cuenta con un seguimiento de tareas y información del estudiante en su ciclo académico, el objetivo de esta aplicación es crear una librería que mediante web scrapping logre tomar esta información y aplicarla en distintas aplicaciones como puede ser el uso automático.

>  Tu apoyo ayuda a que otros usuarios también descubran y se beneficien de este proyecto. Además, nos motiva a seguir mejorando y añadiendo nuevas funcionalidades.

## Uso

```js
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
```