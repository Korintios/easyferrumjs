# Easy Ferrum JS

<img src="banner.png">

Ferrum es una aplicación web de la universidad tecnológico comfenalco la cual cuenta con un seguimiento de tareas y información del estudiante en su ciclo académico, el objetivo de esta aplicación es crear una librería que mediante web scrapping logre tomar esta información y aplicarla en distintas aplicaciones como puede ser el uso automático.

>  Tu apoyo ayuda a que otros usuarios también descubran y se beneficien de este proyecto. Además, nos motiva a seguir mejorando y añadiendo nuevas funcionalidades.

## Uso

```js
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
```

## Información Detallada.
| Funcionalidad | Tipo | Descripción. |
|-|-|-|
| **FerrumUser**   | Clase | Clase principal la cual se crea a partir de un diccionario con un usuario y contraseña.   |
| **studentCode**    | Atributo | Código de estudiante de la plataforma ferrum.   |
| **InitPage**    | Método | Inicializar el usuario dentro de la plataforma.   |
| **getUserInfo**    | Método | Obtener toda la información relevante sobre tu usuario en la plataforma.   |
| **getUserInfo**    | Método | Obtener toda la información relevante sobre tu usuario en la plataforma.   |
| **getHomeworks**    | Método | Obtener todas las tareas disponibles dentro de la plataforma ferrum.   |
