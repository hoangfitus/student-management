import { Logger, Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService, Logger],
})
export class ProgramModule {}
