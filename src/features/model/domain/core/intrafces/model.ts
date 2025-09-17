import { ModelEnum } from "../../entity/model.entity";

export interface ModelData {
    model: ModelEnum;
    messages: Array<{
        content: string;
        role: "user" | "assistant"; // Mudei de "system" para "assistant"
    }>;
    username?: string;
}