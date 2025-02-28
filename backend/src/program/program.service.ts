import { Injectable, Logger } from '@nestjs/common';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { Program } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(
    createProgramDto: CreateProgramDto,
  ): Promise<{ message: string; program: Program }> {
    const program = await this.prisma.program.create({
      data: {
        ...createProgramDto,
      },
    });
    this.logger.log(`Program created: ${program.name}`);
    return {
      message: 'Program created successfully',
      program,
    };
  }

  async findAll(): Promise<Program[]> {
    this.logger.log('Fetching all programs');
    return this.prisma.program.findMany();
  }

  async update(
    id: number,
    updateProgramDto: UpdateProgramDto,
  ): Promise<{ message: string; program: Program }> {
    const program = await this.prisma.program.update({
      where: { id },
      data: {
        ...updateProgramDto,
      },
    });
    this.logger.log(`Program updated to: ${program.name}`);
    return {
      message: 'Program updated successfully',
      program,
    };
  }
}
