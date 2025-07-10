import { Attachment } from "../chat.schema"

interface MessagesResponse {
    messageId: string

    content: string

    conversationId: string

    attachments?: Attachment[]
}

export class SpecificConversationResponse {

    conversationId: string

    lastMessage: string

    lastMessageTime: string

    userId1: string

    userId2: string

    messages?: MessagesResponse[]
}