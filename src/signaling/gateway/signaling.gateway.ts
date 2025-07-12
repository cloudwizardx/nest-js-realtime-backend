/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SignalingService } from "../signaling.service";


@WebSocketGateway({
    cors: {
        methods: ['GET', 'POST'],
        origin: "*",
        credentials: true
    },
    namespace: '/signaling'
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server

    constructor(private signalingService: SignalingService) { }

    handleConnection(client: Socket) {
        try {
            const user = client.data.user
            this.signalingService.addUserSocket(user.userId, client.id)

            client.join(`user_${user.userId}`)
            console.log(`User ${user.userId} connected to signaling`);
        } catch (error) {
            console.error('Signaling connection error:', error);
            client.disconnect()
        }
    }


    handleDisconnect(client: Socket) {
        try {
            const user = client.data.user
            this.signalingService.removeUserSocket(user.userId)
            const activeCall = this.signalingService.getActiveCall(user.userId)
            if (activeCall) {
                this.handleEndCall({ callId: activeCall?.callId }, client)
            }

            console.log(`User ${user.userId} disconnected from signaling`);
        } catch (error) {
            console.error('Signaling disconnect error:', error);
        }
    }

    @SubscribeMessage('endCall')
    handleEndCall(@MessageBody() data: { callId: string },
        @ConnectedSocket() client: Socket
    ) {
        try {
            const { callId } = data
            const call = this.signalingService.endCall(callId)

            if (call) {
                this.server.to(`call_${callId}`).emit('callEnded', { callId })
                this.server.in(`call_${callId}`).socketsLeave(`call_${callId}`)
            }
            return { success: true };
        } catch (error) {
            client.emit('error', { message: 'Failed to end call', error: error.message });
            return { success: false, error: error.message };
        }
    }
}