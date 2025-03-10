import { Module } from '@nestjs/common';
import { DateFormatService } from './date-format.service';

@Module({
  providers: [DateFormatService],
  exports: [DateFormatService],
})
export class CommonModule {}
