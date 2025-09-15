import { Module } from '@nestjs/common';
import { ModelService } from './domain/services/model-service';
import { ModelServiceImpl } from './application/service/model-service-impl.service';

@Module({
    imports: [],
    controllers: [],
    providers: [
        {
            provide: ModelService,
            useClass: ModelServiceImpl
        }
    ],
    exports: [
        {
            provide: ModelService,
            useClass: ModelServiceImpl
        }
    ]
})
export class ModelModule { }
