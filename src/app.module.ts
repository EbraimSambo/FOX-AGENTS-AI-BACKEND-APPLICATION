import { UploadModule } from './features/upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './features/chat/chat.module';
import { ModelModule } from './features/model/model.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    UploadModule,
    ChatModule,
    ModelModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
})
export class AppModule { }
