import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StudentModule } from './student/student.module';
import { FacultyModule } from './faculty/faculty.module';
import { ProgramModule } from './program/program.module';
import { StatusModule } from './status/status.module';
import { PrismaModule } from './prisma/prisma.module';
import { DataModule } from './data/data.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StudentModule,
    FacultyModule,
    ProgramModule,
    StatusModule,
    PrismaModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [Logger],
})
export class AppModule {}
