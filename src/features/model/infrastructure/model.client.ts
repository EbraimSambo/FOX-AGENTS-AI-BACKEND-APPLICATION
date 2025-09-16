import { ModelEnum, ModelType } from "../domain/entity/model.entity";

export const models: Array<ModelType> = [
    {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: 'AIzaSyAviVGc9dPEnVvHBLdLjzm4lAFTde7_bb8',
        model: ModelEnum.GEMINI,
        value: "gemini-2.0-flash"
    }
]