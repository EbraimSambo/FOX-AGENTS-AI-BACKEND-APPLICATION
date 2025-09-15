import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from 'src/features/chat/domain/service/chat.service';
import { ChatFlowDTo } from './dto/flow-chat.dto';

@Controller("chats")
export class ChatController {
    constructor(
        private chatService: ChatService
    ) { }

    @Post("/:uuid")
    async flow(
        @Body() body: ChatFlowDTo,
        @Param("uuid") uuid: string
    ) {
        return await this.chatService.chatFlow({
            chatUUID: uuid,
            prompt: body.prompt
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
