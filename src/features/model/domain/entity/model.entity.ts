
export enum ModelEnum {
    GPT = "GPT",
    GEMINI = "GEMINI",
    CLAUDE = "CLAUDE",
    OLLAMA = "OLLAMA"
}
export interface ModelType{
    baseURL: string
    model: ModelEnum
    apiKey: string
    value: string
}