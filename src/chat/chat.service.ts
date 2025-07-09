import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, Message } from './chat.schema';
import { Model } from 'mongoose';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMessageRequest } from './dto';
import { UserRole } from '../common';
import { timestamp } from 'rxjs';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
        private prismaService: PrismaService
    ) { }

    sendMessage = async (senderId: string, senderRole: string, messageRequest: SendMessageRequest) => {
        const { receiverId, content, attachments } = messageRequest

        const conversationId: string = this.generateConversationObjectId(senderId, receiverId, senderRole)

        const message = new this.messageModel({
            senderId,
            senderRole,
            receiverId,
            content,
            conversationId,
            attachments: attachments || [],
            timestamp: new Date(),
            status: 'Sent'
        })

        const savedMessage = await message.save();
        
        return savedMessage
    }

    generateConversationObjectId = (senderId: string, receiverId: string, senderRole: string): string => {
        switch (senderRole) {
            case UserRole.Doctor.toString():
                return `D_${senderId}_${receiverId}`
            case UserRole.Manager.toString():
                return `M_${senderId}_${receiverId}`
            case UserRole.Admin.toString():
                return `A_${senderId}_${receiverId}`
            default: 
                return `U_${senderId}_${receiverId}`
        }
    }

}
