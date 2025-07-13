/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, Message } from './schema/chat.schema';
import { Model } from 'mongoose';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationSideResponse, GetMessagesRequest, SendMessageRequest, UpdateConversationRequest } from './dto';
import { MessageStatus } from '../common/message.status';
import { CloudService } from '../cloud/cloud.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
        private cloudService: CloudService,
        private prismaService: PrismaService
    ) { }

    sendMessage = async (senderId: string, senderRole: string, messageRequest: SendMessageRequest) => {
        const { receiverId, content, receiverRole, attachments } = messageRequest

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
            conversationId: cId,
            receiverRole: receiverRole
        })

        if (attachments?.length) {
            const uploadedAttachments: { url: string; type: string; filename: string }[] = [];
            for (const file of attachments) {
                const uploadedResult = await this.cloudService.uploadFile(file.base64, 'chat_resources')

                uploadedAttachments.push({
                    url: uploadedResult.secure_url,
                    type: uploadedResult.resource_type,
                    filename: uploadedResult.original_filename
                })
            }

            const updatedMessage = await this.messageModel.findByIdAndUpdate(
                savedMessage._id,
                {
                    status: MessageStatus.Sent,
                    attachments: uploadedAttachments,
                },
                { new: true }, // return updated document
            );
            return updatedMessage;
        }

        const finalMessage = await this.messageModel.findByIdAndUpdate(
            savedMessage._id,
            { status: MessageStatus.Sent },
            { new: true },
        );

        return finalMessage;
    }


    async getConversationsSide(currentUserId: string): Promise<ConversationSideResponse[]> {
        const conversations = await this.conversationModel.find({
            $or: [{ userId1: currentUserId }, { userId2: currentUserId }],
        });

        const results: ConversationSideResponse[] = [];

        for (const conv of conversations) {
            const isUser1 = conv.userId1 === currentUserId;
            const receiverId = isUser1 ? conv.userId2 : conv.userId1;
            const receiverRole = isUser1 ? conv.role2 : conv.role1;
            const unreadCount = conv.unreadCount?.[receiverId] || 0;

            // Lấy thông tin user từ MongoDB qua Prisma
            const receiver = await this.prismaService.user.findUnique({
                where: { userId: receiverId },
            });

            if (!receiver) continue;

            results.push({
                id: conv.conversationId,
                receiverId,
                receiverFirstName: receiver.firstName,
                receiverLastName: receiver.lastName,
                receiverRole: receiver.role,
                avatar: receiver.avatarUrl || '',
                lastMessage: conv.lastMessage,
                lastTime: conv.lastMessageTime?.toISOString(),
                unreadCount,
                isOnline: receiver.isOnline,
            });
        }

        return results;
    }


    private async updateConversation(messageRequest: UpdateConversationRequest) {
        const { conversationId, lastMessage, senderId, receiverId } = messageRequest;

        const loadedConversation = await this.conversationModel.findOne({ conversationId });

        if (!loadedConversation) {
            const conversation = new this.conversationModel({
                conversationId,
                userId1: senderId,
                userId2: receiverId,
                lastMessage,
                lastMessageTime: new Date(),
                unreadCount: {
                    [receiverId]: 1,
                },
            });

            await conversation.save();
        } else {
            const currentUnread = loadedConversation.unreadCount?.[receiverId] || 0;

            loadedConversation.lastMessage = lastMessage;
            loadedConversation.lastMessageTime = new Date();
            loadedConversation.unreadCount = {
                ...loadedConversation.unreadCount,
                [receiverId]: currentUnread + 1,
            };

            await loadedConversation.save();
        }
    }

    generateConversationId = (userId1: string, userId2: string): string => {
        const sorted = [userId1, userId2].sort();
        return `${sorted[0]}_${sorted[1]}`;
    }

    getMessages = async (request: GetMessagesRequest) => {
        const messages = await this.messageModel.find({
            conversationId: request.conversationId
        }).sort({ timestamp: -1 })
            .skip((request.page - 1) * request.limit)
            .limit(request.limit)

        return messages.reverse()
    }

    getConversations = async (userId: string) => {
        const conversations = await this.conversationModel.find({ userId })
            .sort({ timestamp: -1 })

        return conversations
    }

    getSpecificConversation = async (userId1: string, userId2: string) => {
        const cId = this.generateConversationId(userId1, userId2)
        const conversation = await this.conversationModel.findOne({ conversationId: cId })
        if (!conversation) {
            return
        }

        const loadMessages = await this.messageModel.find({ conversationId: cId }).sort({ timestamp: -1 })

        const messages = loadMessages.map(msg => ({
            messageId: msg._id.toString(),
            content: msg.content,
            conversationId: msg.conversationId,
            attachments: msg.attachments,
        }))


        return {
            conversationId: conversation.conversationId,
            lastMessage: conversation.lastMessage,
            lastMessageTime: conversation.lastMessageTime.toISOString(),
            userId1: conversation.userId1,
            userId2: conversation.userId2,
            messages,
        }
    }

    updateMessageStatus = async (messageId: string, status: string) => {
        const message = await this.messageModel.findByIdAndUpdate(
            messageId,
            { status },
            { new: true } // return document after update
        );

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        return message;
    }

    getUserOnlineStatus = async (userId: string) => {
        const user = await this.prismaService.user.findUnique({
            where: {
                userId: userId
            },
            select: { isOnline: true, lastSeen: true }
        })

        return user
    }

    updateUserOnlineStatus = async (userId: string, isOnline: boolean) => {
        const existingUser = await this.prismaService.user.findUnique({
            where: { userId },
        })

        if (existingUser) {
            await this.prismaService.user.update({
                where: { userId },
                data: {
                    isOnline: isOnline,
                    lastSeen: new Date()
                }
            })
        } else {
            throw new NotFoundException("User not found!")
        }
    }

}