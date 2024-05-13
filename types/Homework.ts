type ferrumString = string
export type ferrumTaskType = "Task" | "Self Evaluation"
export type TaskStatus = "Send" | "Not Send" | "Unknown"


export interface Homework {
    id?: ferrumString
    title: ferrumString
    course: ferrumString
    sendDate: ferrumString
    status?: ferrumString
    description?: ferrumString
    type: ferrumTaskType
    timeLeft?: ferrumString
    taskScore?: ferrumString
    statusSend?: TaskStatus
    lastModification?: ferrumString
}