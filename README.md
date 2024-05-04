# Easy Ferrum JS

<img src="banner.png">

Ferrum es una aplicación web de la universidad tecnológico comfenalco la cual cuenta con un seguimiento de tareas y información del estudiante en su ciclo académico, el objetivo de esta aplicación es crear una librería que mediante web scrapping logre tomar esta información y aplicarla en distintas aplicaciones como puede ser el uso automático.

>  Tu apoyo ayuda a que otros usuarios también descubran y se beneficien de este proyecto. Además, nos motiva a seguir mejorando y añadiendo nuevas funcionalidades.

## Uso

```js
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
        const allTasksPending = await ferrumUser.getHomeworks("Pending")
        const allTasksSend = await ferrumUser.getHomeworks("Send")
        const allTasks = await ferrumUser.getHomeworks("All")
        console.log(allTasks)

        // Obtenemos el estado de alguna tarea.
        const task = await ferrumUser.getHomeworkInfo("1370701")
        console.log(task)
    } catch (error) {
        console.error("Error in FerrumJS", error);
    }
}

fetchUserInfo()
```

## Información Detallada.
| Funcionalidad | Tipo | Descripción. |
|-|-|-|
| **FerrumUser**   | Clase | Clase principal la cual se crea a partir de un diccionario con un usuario y contraseña.   |
| **InitPage**    | Método | Inicializar el usuario dentro de la plataforma.   |
| **studentCode**    | Atributo | Código de estudiante de la plataforma ferrum.   |
| **userInfo**    | Método | Obtener toda la información relevante sobre tu usuario en la plataforma.   |
| **getHomeworks**    | Método | Obtener todas las tareas parametrizadas disponibles dentro de la plataforma ferrum.   |
| **getHomeworkInfo**    | Método | Obtener información de una tarea en especifico.   |

