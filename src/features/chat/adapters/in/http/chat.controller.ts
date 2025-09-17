import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService } from 'src/features/chat/domain/service/chat.service';
import { ChatFlowDTo } from './dto/flow-chat.dto';
import { Request } from 'express';

@Controller("chats")
export class ChatController {
    constructor(
        private chatService: ChatService
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
    async chatFlow(
      @Body() body: ChatFlowDTo,
      @Param("uuid") uuid: string,
      @Headers("user-x-uuid") userUUID?: string,
      @Headers("user-x-name") userName?: string,
      @Req() req?: Request, // Adicionar o Request para acessar o abort signal
    ) {
      // Criar um AbortController para esta requisição
      const abortController = new AbortController();
      
      // Escutar o evento de abort da requisição do cliente
      req?.on('close', () => {
        if (!req.complete) {
          console.log(`Requisição abortada pelo cliente: ${uuid}`);
          abortController.abort();
        }
      });
    
      try {
        return await this.chatService.chatFlow({
          chatUUID: uuid,
          prompt: body.prompt,
          userUUID,
          username: userName,
          model: body.model,
          abortSignal: abortController.signal // Passar o signal para o service
        });
      } catch (error) {
        // Se a operação foi abortada, retornar um erro específico
        if (error.name === 'AbortError') {
          throw new HttpException('Request aborted', HttpStatus.REQUEST_TIMEOUT);
        }
        throw error;
      }
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
