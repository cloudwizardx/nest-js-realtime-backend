/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema, Message, MessageSchema } from './schema/chat.schema';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Message.name, schema: MessageSchema}, // create model with name Message from Schema - Message.name = self-name 
      {name: Conversation.name, schema: ConversationSchema}
    ]),
    PrismaModule
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
