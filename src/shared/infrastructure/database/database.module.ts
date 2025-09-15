import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseServiceImpl } from './service/database.service';
import { DatabaseService } from '../../domain/core/db';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DatabaseService,
      useClass: DatabaseServiceImpl,
    },
  ],
  exports: [
    {
      provide: DatabaseService,
      useClass: DatabaseServiceImpl,
    },
  ],
})
export class DatabaseModule { }
