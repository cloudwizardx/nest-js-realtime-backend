/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseGuards } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "../chat.service";
import { SendMessageRequest } from "../dto";
import { CurrentUser } from "src/common";
import { WsAuthGuard } from "src/common/guard/ws.auth.guard";

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST',],
        credentials: true
    },
    namespace: '/chat'
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    private connectedUsers = new Map<string, string>()

    constructor(private chatService: ChatService) { }

    async handleConnection(client: Socket) {
        try {
            const user = client.data.user
            this.connectedUsers.set(user.userId, client.id)
            await this.chatService.updateUserOnlineStatus(user.userId, true)
            client.join(`user_${user.userId}`)

            this.server.emit('userOnline', { userId: user.userId, isOnline: true })
            console.log(`User ${user.userId} connected`)
        } catch (error) {
            console.log(error)
            client.disconnect()
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            const user = client.data.user
            if (user) {
                this.connectedUsers.delete(user.userId)
                await this.chatService.updateUserOnlineStatus(user.userId, false)
                this.server.emit('userOffline', { userId: user.userId, isOnline: false })
                console.log(`User ${user.userId} disconnected`)
            }
        } catch (error) {
            console.log(error)
            client.disconnect()
        }
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() messageRequest: SendMessageRequest,
        @ConnectedSocket() client: Socket,
        @CurrentUser() user: any) {
        try {
            const message = await this.chatService.sendMessage(user.userId, user.role, messageRequest)
            client.emit('messageReceived', message)
            const receiverSocket = this.connectedUsers.get(messageRequest.receiverId)
            if (receiverSocket) {
                this.server.to(receiverSocket).emit('newMessage', message)
            }

            this.server.to(`user_${messageRequest.receiverId}`).emit('newMessage', message)
            return { success: true, message };
        } catch (error) {
            console.log(error)
            client.emit('error', { message: 'Failed to send message', error: error.message });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(@MessageBody() request: { conversationId: string },
        @ConnectedSocket() client: Socket,
        @CurrentUser() user: any) {
        try {
            client.join(request.conversationId)
            console.log(`User ${user.userId} joined conversation ${request.conversationId}`)
            return { success: true }
        } catch (error) {
            console.log(error)
            return { success: false }
        }
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(@MessageBody() request: { conversationId: string },
        @ConnectedSocket() client: Socket,
        @CurrentUser() user: any) {
        try {
            client.leave(request.conversationId)
            console.log(`User ${user.userId} leave conversation ${request.conversationId}`)
            return { success: true }
        } catch (error) {
            console.log(error)
            return { success: false }
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @MessageBody() data: { conversationId: string, isTyping: boolean },
        @ConnectedSocket() client: Socket,
        @CurrentUser() user: any,
    ) {
        client.to(data.conversationId).emit('userTyping', {
            userId: user.userId,
            isTyping: data.isTyping
        });
    }

    @SubscribeMessage('getOnlineStatus')
    async handleGetOnlineStatus(
        @MessageBody() data: { userId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const status = await this.chatService.getUserOnlineStatus(data.userId);
        client.emit('onlineStatus', { userId: data.userId, ...status });
    }
}