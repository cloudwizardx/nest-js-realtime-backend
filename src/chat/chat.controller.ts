/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
import { Controller, Get, UseGuards } from '@nestjs/common';
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
    async geet



}
