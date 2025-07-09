import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRoot(process.env.DATABASE_URL || ""),
    PrismaModule,
    ChatModule]
})
export class AppModule { }
