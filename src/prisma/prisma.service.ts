import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
    constructor(configService: ConfigService) {
        super({
            datasources: {
                db: {
                    url: configService.get('DATABASE_URL')
                }
            }
        });
    }

    async onModuleInit() {
        return this.$connect()
    }
}
