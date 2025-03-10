import { Logger, Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { CommonModule } from '../common/common.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [CommonModule],
  controllers: [StudentController],
  providers: [StudentService, Logger, ConfigService],
})
export class StudentModule {}
