import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema()
export class Attachment {
    @Prop()
    url: string

    @Prop()
    fileName: string

    @Prop()
    type: string
}

@Schema({ timestamps: true })
export class Message extends Document {
    @Prop({ required: true })
    senderId: string

    @Prop({ required: true })
    receiverId: string

    @Prop({ required: true, enum: ['Doctor', 'User', 'Manager', 'Admin'] })
    senderRole: string

    @Prop({ required: true })
    content: string

    @Prop({ default: Date.now })
    timestamp: Date

    @Prop({ required: true })
    conversationId: string

    @Prop({ default: 'Sent', enum: ['Sent', 'Uploading', 'Delivered', 'Seen'] })
    status: string

    @Prop([Attachment])
    attachments: Attachment[]
}

@Schema({ timestamps: true })
export class Conversation extends Document {
    @Prop({ required: true, unique: true })
    conversationId: string

    @Prop({ required: true })
    userId1: string

    @Prop({ required: true })
    userId2: string

    @Prop({ required: true })
    role1: string

    @Prop({ required: true })
    role2: string

    @Prop()
    lastMessage: string

    @Prop({ default: Date.now })
    lastMessageTime: Date

    @Prop({ default: {} })
    unreadCount: {
        userId1?: number;
        userId2?: number;
    };

}

export const MessageSchema = SchemaFactory.createForClass(Message) // return Mongoose.schema
export const ConversationSchema = SchemaFactory.createForClass(Conversation)


