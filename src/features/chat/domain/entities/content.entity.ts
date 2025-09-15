import { ModelEnum } from "src/features/model/domain/entity/model.entity"

export enum Role{
    USER = "USER",
    MODEL = "MODEL"
}
export class Content{
    uuid: string
    content: string
    model: ModelEnum
    role: Role
    chatId: number
    userId?: number
}

export class Chat{
    uuid: string
    id: number
    tittle?: string
    createdAt: Date
    updatedAt: Date
    userId?: number
}