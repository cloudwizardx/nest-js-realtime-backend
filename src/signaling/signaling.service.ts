/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Socket, DefaultEventsMap } from 'socket.io';
import { SignalingStatus } from 'src/common';

interface CallSession {
    callId: string
    participants: string[]
    status: SignalingStatus
    startTime: Date
    endTime?: Date
}

@Injectable()
export class SignalingService {
    private activeCalls = new Map<string, CallSession>()
    private userSockets = new Map<string, string>()

    addUserSocket(userId: string, socketId: string) {
        this.userSockets.set(userId, socketId)
    }

    removeUserSocket(userId: string) {
        this.userSockets.delete(userId)
    }

    getUserSocketId(userId: string): string | undefined {
        return this.userSockets.get(userId)
    }

    createCall(callId: string, callerId: string, receiverId: string): CallSession {
        const callSession: CallSession = {
            callId,
            participants: [callerId, receiverId], 
            status: SignalingStatus.Calling,
            startTime: new Date(),
        };

        this.activeCalls.set(callId, callSession);
        return callSession;
    }

    getCall(callId: string): CallSession | undefined {
        return this.activeCalls.get(callId);
    }

    updateCallStatus(callId: string, status: SignalingStatus) {
        const call = this.activeCalls.get(callId);
        if (call) {
            call.status = status;
            if (status === SignalingStatus.Ended) {
                call.endTime = new Date();
            }
        }
    }

    endCall(callId: string) {
        const call = this.activeCalls.get(callId);
        if (call) {
            call.status = SignalingStatus.Ended;
            call.endTime = new Date();
            this.activeCalls.delete(callId);
        }
        return call;
    }

    getActiveCall(userId: string): CallSession | undefined {
        for (const [callId, call] of this.activeCalls.entries()) {
            if (call.participants.includes(userId) && call.status !== SignalingStatus.Ended) {
                return call;
            }
        }
        return undefined;
    }

    getUserActiveCalls(userId: string): CallSession[] {
        return Array.from(this.activeCalls.values()).filter(
            call => call.participants.includes(userId) && call.status !== SignalingStatus.Ended
        );
    }
}
