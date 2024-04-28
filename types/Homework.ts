type ferrumString = string | undefined

export interface Homework {
    title: ferrumString
    course: ferrumString
    sendDate: ferrumString
    status: ferrumString
    description?: ferrumString
}