import { Injectable, Logger } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Faculty } from '@prisma/client';

@Injectable()
export class FacultyService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(
    createFacultyDto: CreateFacultyDto,
  ): Promise<{ message: string; faculty: Faculty }> {
    const data = {
      ...createFacultyDto,
    };
    const faculty = await this.prisma.faculty.create({ data });
    this.logger.log(`Faculty created: ${faculty.name}`);
    return {
      message: 'Faculty created successfully',
      faculty,
    };
  }

  async findAll(): Promise<Faculty[]> {
    this.logger.log('Fetching all faculties');
    return this.prisma.faculty.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(
    id: number,
    updateFacultyDto: UpdateFacultyDto,
  ): Promise<{ message: string; faculty: Faculty }> {
    const data = {
      ...updateFacultyDto,
    };
    const faculty = await this.prisma.faculty.update({
      where: { id },
      data,
    });
    this.logger.log(`Faculty updated to: ${faculty.name}`);
    return {
      message: 'Faculty updated successfully',
      faculty,
    };
  }
}
