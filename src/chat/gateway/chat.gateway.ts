/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseGuards } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { WsAuthGuard } from "src/common";
import { ChatService } from "../chat.service";


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

}