import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { CloudService } from './cloud/cloud.service';
import { CloudModule } from './cloud/cloud.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRoot(process.env.DATABASE_URL || ""),
    PrismaModule,
    ChatModule,
    CloudModule],
  providers: [CloudService]
})
export class AppModule { }
