import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StudentModule } from './student/student.module';
import { FacultyModule } from './faculty/faculty.module';
import { ProgramModule } from './program/program.module';
import { StatusModule } from './status/status.module';
import { PrismaModule } from './prisma/prisma.module';
import { DataModule } from './data/data.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    StudentModule,
    FacultyModule,
    ProgramModule,
    StatusModule,
    PrismaModule,
    DataModule,
    ConfigModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
