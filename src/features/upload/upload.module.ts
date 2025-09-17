import { Module } from '@nestjs/common';
import { UploadServiceImpl } from './services/upload.service';
import { UploadService } from './domain/upload-service';
import { CloudinaryProvider } from './infra/cloudinary/cloudinary.provider';
import { FileProcessingService } from './services/fileprocessing.service';

@Module({
    imports: [],
    controllers: [],
    providers: [
        CloudinaryProvider,
        {
            provide: UploadService,
            useClass: UploadServiceImpl
        },
        FileProcessingService
    ],
    exports: [
        {
            provide: UploadService,
            useClass: UploadServiceImpl
        },
        CloudinaryProvider,
        FileProcessingService
    ]
})
export class UploadModule { }
