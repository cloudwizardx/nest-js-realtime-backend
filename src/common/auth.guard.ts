/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsAuthGuard implements CanActivate {

    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const client: Socket = context.switchToWs().getClient();
        const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new WsException('Unauthorized');
        }

        try {
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
            return true;
        } catch (error) {
            console.log(error)
            throw new WsException('Invalid token');
        }
    }
}



