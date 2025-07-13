/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guard';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/common';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {

    constructor(private chatService: ChatService) { }

    @Get('conversations')
    async getConversations(@CurrentUser() user: any) {
        return this.chatService.getConversations(user.userId)
    }

    @Get('specific-conversation')
    async getSpecificConversation(@CurrentUser() user: any, @Query('userId2') userId2: string) {
        return this.chatService.getSpecificConversation(user.userId, userId2)
    }

    @Get('messages/:conversationId')
    async getMessages(
        @Param('conversationId') conversationId: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 50,
    ) {
        return this.chatService.getMessages({conversationId, page, limit});
    }

    @Get('conversations-sides/:currentUserId')
    async getConversationsSide (
        @Param('currentUserId') currentUserId: string
    ) {
        
    }

}
