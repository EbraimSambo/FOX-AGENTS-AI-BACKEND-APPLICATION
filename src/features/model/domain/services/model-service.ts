import { ModelData } from "../core/intrafces/model";

export abstract class ModelService {
    abstract generateResponse(data: ModelData): Promise<{
        response: string;
    }>
    abstract generateTitle(prompt: string,   abortSignal?: AbortSignal): Promise<string>
}