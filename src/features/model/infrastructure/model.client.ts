import { ModelEnum, ModelType } from "../domain/entity/model.entity";

export const models: Array<ModelType> = [
    {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: 'AIzaSyAZfHE5L0fGHFihzLZjS8Ff3GZdHWWHVNU',
        model: ModelEnum.GEMINI,
        value: "gemini-2.0-flash"
    }
]