import { Injectable } from '@nestjs/common';
import { ModelService } from '../../domain/services/model-service';
import { ModelFactory } from '../../infrastructure/model.builder';
import { ModelData } from '../../domain/core/intrafces/model';
import { getValueModel } from '../../infrastructure/get-model';
import { ChatCompletionMessageParam } from 'openai/resources/index';

@Injectable()
export class ModelServiceImpl implements ModelService {

    async generateResponse(data: ModelData) {
        const values = getValueModel(data.model)
        const model = ModelFactory.builder({
            apiKey: values.apiKey,
            baseURL: values.baseURL,
        })
        const completion = await model.chat.completions.create({
            messages: [...data.messages],
            model: values.value,
        });
        console.log(completion.choices[0].message.content)
        return {
            response: completion.choices[0].message.content as string
        }
    }
}
