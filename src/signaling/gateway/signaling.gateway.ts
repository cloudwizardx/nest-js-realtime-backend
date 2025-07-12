/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
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
        throw new Error("Method not implemented.");
    }
}