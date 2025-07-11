import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {}
