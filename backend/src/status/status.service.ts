import { Injectable, Logger } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { StudentStatus } from '@prisma/client';

@Injectable()
export class StatusService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(
    createStatusDto: CreateStatusDto,
  ): Promise<{ message: string; status: StudentStatus }> {
    const status = await this.prisma.studentStatus.create({
      data: {
        ...createStatusDto,
      },
    });
    this.logger.log(`Status created: ${status.name}`);
    return {
      message: 'Status created successfully',
      status,
    };
  }

  async findAll(): Promise<StudentStatus[]> {
    this.logger.log('Fetching all statuses');
    return this.prisma.studentStatus.findMany();
  }

  async update(
    id: number,
    updateStatusDto: UpdateStatusDto,
  ): Promise<{ message: string; status: StudentStatus }> {
    const status = await this.prisma.studentStatus.update({
      where: { id },
      data: {
        ...updateStatusDto,
      },
    });
    this.logger.log(`Status updated to: ${status.name}`);
    return {
      message: 'Status updated successfully',
      status,
    };
  }
}
