type ferrumString = string
type ferrumTaskType = "Tarea" | "Evaluación" | "Auto Evaluación"

export interface Homework {
    title: ferrumString
    course: ferrumString
    sendDate: ferrumString
    status: ferrumString
    description?: ferrumString
    type: ferrumTaskType
    id: ferrumString
    info?: HomeworkInfo
}

export interface HomeworkInfo {
    timeLeft?: ferrumString
    taskScore?: ferrumString
    statusSend?: ferrumString
    lastModification?: ferrumString
}