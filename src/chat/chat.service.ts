import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, Message } from './chat.schema';
import { Model } from 'mongoose';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetMessagesRequest, SendMessageRequest, UpdateConversationRequest } from './dto';
import { MessageStatus } from 'src/common/message.status';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
        private prismaService: PrismaService
    ) { }

    sendMessage = async (senderId: string, senderRole: string, messageRequest: SendMessageRequest) => {
        const { receiverId, content } = messageRequest

        const cId: string = this.generateConversationId(senderId, receiverId)

        const message = new this.messageModel({
            senderId: senderId,
            senderRole: senderRole,
            receiverId: receiverId,
            status: MessageStatus.Uploading,
            attachments: [],
            conversationId: cId,
            content: content,
            timestamp: new Date()
        })

        const savedMessage = await message.save();
        await this.updateConversation({
            senderId: senderId,
            senderRole: senderRole,
            receiverId: receiverId,
            lastMessage: content,
            conversationId: cId
        })
        
        return savedMessage
    }

    private async updateConversation(messageRequest: UpdateConversationRequest) {
        const { conversationId, lastMessage, senderId, receiverId } = messageRequest

        const loadedConversation = await this.conversationModel.findOne({ conversationId })

        if (!loadedConversation) {
            const conversation = new this.conversationModel({
                conversationId: conversationId,
                userId1: senderId,
                userId2: receiverId,
                lastMessage: lastMessage,
                lastMessageTime: new Date()
            })

            await conversation.save()
        } else {
            loadedConversation.lastMessage = lastMessage
            loadedConversation.lastMessageTime = new Date()

            await loadedConversation.save()
        }
    }

    generateConversationId = (userId1: string, userId2: string): string => {
        const sorted = [userId1, userId2].sort();
        return `${sorted[0]}_${sorted[1]}`;
    }

    getMessages = async (request: GetMessagesRequest) => {
        const messages = await this.messageModel.find({
            conversationId: request.conversationId
        }).sort({timestamp: -1})
        .skip((request.page - 1)*request.limit)
        .limit(request.limit)

        return messages.reverse()
    }

}
