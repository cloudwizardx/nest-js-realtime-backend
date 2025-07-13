export class ConversationSideResponse {
    id: string;
    receiverId: string
    receiverFirstName: string;
    receiverLastName: string;
    receiverRole: string;
    avatar: string;
    lastMessage: string;
    lastTime: string;
    unreadCount: number;
    isOnline: boolean;
}