import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './features/chat/chat.module';
import { ModelModule } from './features/model/model.module';
import { Module } from '@nestjs/common';
import { TestController } from './test.controller';

@Module({
  imports: [
    ChatModule,
    ModelModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers:[
    TestController
  ]
})
export class AppModule { }
