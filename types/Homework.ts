type ferrumString = string
export type FerrumTaskType = "Task" | "Self Evaluation"
export type TaskStatus = "Enviado para calificar" | "No entregado" | "Unknown"



export interface Homework {
    id?: ferrumString
    title: ferrumString
    course: ferrumString
    sendDate: ferrumString
    status?: ferrumString
    description?: ferrumString
    type: FerrumTaskType
    timeLeft?: ferrumString
    taskScore?: ferrumString
    statusSend?: TaskStatus
    lastModification?: ferrumString
}