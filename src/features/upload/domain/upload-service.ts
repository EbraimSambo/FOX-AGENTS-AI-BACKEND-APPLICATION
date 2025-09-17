import { UploadApiResponse } from "cloudinary";

export abstract class UploadService{
   abstract uploadFile(file: Express.Multer.File): Promise<UploadApiResponse>
   abstract uploadFiles(files: Express.Multer.File[]): Promise<UploadApiResponse[]>
}