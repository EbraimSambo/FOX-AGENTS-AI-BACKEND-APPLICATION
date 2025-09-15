import { IsNotEmpty, IsString } from "class-validator";



export class ChatFlowDTo{
    @IsString()
    @IsNotEmpty()
    prompt: string
}