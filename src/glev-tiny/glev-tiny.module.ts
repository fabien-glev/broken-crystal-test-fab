import { Module } from '@nestjs/common';
import { GlevTinyController } from './tiny-vuln.controller';

@Module({
  controllers: [GlevTinyController],
})
export class GlevTinyModule {}
