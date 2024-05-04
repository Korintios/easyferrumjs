type ferrumString = string
type ferrumTaskType = "Tarea" | "Evaluación" | "Auto Evaluación"
export type TaskStatus = "Enviado para calificar" | "No entregado" | "Desconocido"


export interface Homework {
    id: ferrumString
    title: ferrumString
    course: ferrumString
    sendDate: ferrumString
    status: ferrumString
    description?: ferrumString
    type: ferrumTaskType
    timeLeft?: ferrumString
    taskScore?: ferrumString
    statusSend?: TaskStatus
    lastModification?: ferrumString
}