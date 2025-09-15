
export enum ModelEnum {
    GPT = "GPT",
    GEMINI = "GEMINI",
    CLAUDE = "CLAUDE"
}
export interface ModelType{
    baseURL: string
    model: ModelEnum
    apiKey: string
    value: string
}