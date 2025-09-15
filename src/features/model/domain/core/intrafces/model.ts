import { ModelEnum, ModelType } from "../../entity/model.entity";

export interface ModelData{
    model: ModelEnum
    messages: Array<{
        content: string;
        role: "user" | "system" 
    }>
    username?: string
}