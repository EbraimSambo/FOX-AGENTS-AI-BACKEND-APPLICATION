import { ChatController } from './adapters/in/http/chat.controller';
import { Module } from '@nestjs/common';
import { ChatRepositoryImpl } from './adapters/in/out/repository/chat-repository-impl.repository';
import { DatabaseModule } from 'src/shared/infrastructure/database/database.module';
import { ChatRepository } from './domain/repository/chat.repository';
import { ChatServiceImpl } from './application/services/chat-impl.service';
import { ChatService } from './domain/service/chat.service';
import { ModelModule } from '../model/model.module';
import { UploadModule } from '../upload/upload.module';

@Module({
    imports: [
        DatabaseModule,
        ModelModule,
        UploadModule
    ],
    controllers: [
        ChatController,
    ],
    providers: [
        {
            provide: ChatRepository,
            useClass: ChatRepositoryImpl
        },
        {
            provide: ChatService,
            useClass: ChatServiceImpl
        }
    ],
})
export class ChatModule { }
