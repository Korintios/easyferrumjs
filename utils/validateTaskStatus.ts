import { TaskStatus } from "../types/Homework";

export function validateTaskStatus(status: TaskStatus): boolean {
    return status === "Enviado para calificar" ||
           status === "No entregado" ||
           status === "Desconocido";
}