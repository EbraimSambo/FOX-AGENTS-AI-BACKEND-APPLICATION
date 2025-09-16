import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { ModelEnum } from "src/features/model/domain/entity/model.entity";



export class ChatFlowDTo{
    @IsString()
    @IsNotEmpty()
    prompt: string

    @IsIn([ "GPT", "GEMINI", "CLAUDE","OLLAMA"])
    model?: ModelEnum
}