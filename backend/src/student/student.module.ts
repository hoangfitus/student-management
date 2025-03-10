import { Logger, Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { ConfigService } from 'src/config/config.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [StudentController],
  providers: [StudentService, Logger, ConfigService],
})
export class StudentModule {}
