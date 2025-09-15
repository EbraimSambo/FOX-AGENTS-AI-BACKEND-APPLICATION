import { ModelEnum, ModelType } from "../domain/entity/model.entity";

export const models: Array<ModelType> = [
    {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: 'AIzaSyCn__Oc_08WjQnAVLIZtji9tJu5ttBuuys',
        model: ModelEnum.GEMINI,
        value: "gemini-2.0-flash"
    }
]