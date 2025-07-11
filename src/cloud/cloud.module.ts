import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';

@Module({
  providers: [CloudService]
})
export class CloudModule {}
