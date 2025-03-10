import { Logger, Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [DataController],
  providers: [DataService, Logger],
})
export class DataModule {}
