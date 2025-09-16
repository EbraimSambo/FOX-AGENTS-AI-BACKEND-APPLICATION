import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ModelEnum } from "src/features/model/domain/entity/model.entity";



export class ChatFlowDTo{
    @IsString()
    @IsNotEmpty()
    prompt: string

    @IsString()
    @IsOptional()
    model?: ModelEnum
}