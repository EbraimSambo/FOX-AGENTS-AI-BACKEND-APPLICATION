import { Body, Controller, Get, Headers, Param, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ChatService } from 'src/features/chat/domain/service/chat.service';
import { ChatFlowDTo } from './dto/flow-chat.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/features/upload/domain/upload-service';

@Controller("chats")
export class ChatController {
    constructor(
        private chatService: ChatService,
        private uploadService: UploadService
    ) { }

    @Get()
    async findAllchats(
        @Query("page") page: string,
        @Query("limit") limit: string,
        @Headers("user-x-uuid") userUUID: string,
        @Query("name") name: string

    ) {
        return await this.chatService.findAllchats({
            userUUID,
            pagination: {
                limit: limit ? 40 : +limit,
                page: page ? 1 : +page,
            },
            name
        })
    }

    @Post("/:uuid")
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'files', maxCount: 10 },
        ]),
    )
    async chatFlow(
        @Body() body: ChatFlowDTo,
        @Param("uuid") uuid: string,
        @Headers("user-x-uuid") userUUID?: string,
        @Headers("user-x-name") userName?: string,
        @UploadedFiles() files?: {
            files?: Express.Multer.File[];
        },
    ) {
        let attachments: Array<{
            url: string,
            type: string
        }> = []
        if (files?.files && files.files.length > 0) {
            const results = await this.uploadService.uploadFiles(files?.files);
            console.log(results)
            attachments = results.map((t) => ({
                url: t.url,
                type: t.resource_type
            }))
        }
        return await this.chatService.chatFlow({
            chatUUID: uuid,
            prompt: body.prompt,
            userUUID,
            username: userName,
            model: body.model,
            files: files?.files || [],
            attachments,
        })
    }


    @Get("messages/:uuid")
    async findAllMessages(
        @Param("uuid") chatUUID: string,
        @Query("page") page: string,
        @Query("limit") limit: string
    ) {
        return await this.chatService.findAllMessages({
            chatUUID,
            pagination: {
                limit: limit ? 40 : +limit,
                page: page ? 1 : +page
            }
        })
    }
}
