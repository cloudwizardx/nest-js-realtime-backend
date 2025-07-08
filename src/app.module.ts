import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), 
    MongooseModule.forRoot(process.env.DATABASE_URL || ""),
    PrismaModule]
})
export class AppModule { }
