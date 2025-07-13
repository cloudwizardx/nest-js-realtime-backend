import { Attachment } from "../schema";

export class MessageSideResponse {
    _id: string;
    content: string;
    receiverName: string;
    currentUserId: string;
    receiverId: string;
    receiverRole: string;
    currentUserRole: string;
    timestamp: string;
    status: string;
    attachments?: Attachment[];
}