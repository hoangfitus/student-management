import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { Logger } from '@nestjs/common';
@Module({
  controllers: [ConfigController],
  providers: [ConfigService, Logger],
})
export class ConfigModule {}
