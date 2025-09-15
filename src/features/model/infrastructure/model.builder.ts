import OpenAI from "openai";
import { ModelType } from "../domain/entity/model.entity";


export class ModelFactory {
    static builder(model: Omit<ModelType, "model" | "value">): OpenAI {
        const openai = new OpenAI({
            baseURL: model.baseURL,
            apiKey: model.apiKey,
        });
        return openai;
    }
}
