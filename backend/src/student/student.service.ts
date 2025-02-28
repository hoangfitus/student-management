import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
  ): Promise<{ message: string; student: Student }> {
    const data: Prisma.StudentCreateInput = {
      ...createStudentDto,
    };
    const student = await this.prisma.student.create({ data });
    this.logger.log(`Student created: ${student.name}`);
    return {
      message: 'Student created successfully',
      student,
    };
  }

  async findAll(
    search: string,
    faculty: string,
    page: number,
    limit: number,
  ): Promise<{ total: number; students: Student[] }> {
    const whereClause: any = {
      OR: [
        { mssv: { contains: search, lte: 'insensitive' } },
        { name: { contains: search, lte: 'insensitive' } },
      ],
    };

    if (faculty && faculty.trim() !== '') {
      whereClause.faculty = { contains: faculty, lte: 'insensitive' };
    }

    const students = await this.prisma.student.findMany({
      where: whereClause,
      take: limit,
      skip: page * limit,
      orderBy: { mssv: 'asc' },
    });
    const total = students.length;
    this.logger.log(`Fetching all students`);
    return { total, students };
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<{ message: string; student: Student }> {
    const existing = await this.prisma.student.findUnique({
      where: { mssv: id.toString() },
    });
    if (!existing) {
      throw new NotFoundException(`Student with MSSV ${id} not found`);
    }
    // Enforce status transition rules if status is being updated
    if (
      updateStudentDto.status &&
      updateStudentDto.status !== existing.status
    ) {
      if (existing.status === 'Đang học') {
        const allowedTransitions = [
          'Đã tốt nghiệp',
          'Đã thôi học',
          'Tạm dừng học',
        ];
        if (!allowedTransitions.includes(updateStudentDto.status)) {
          throw new BadRequestException(
            `Invalid status transition from "Đang học" to "${updateStudentDto.status}"`,
          );
        }
      }
      // If current status is "Đã tốt nghiệp", cannot change to "Đang học"
      if (
        existing.status === 'Đã tốt nghiệp' &&
        (updateStudentDto.status === 'Đang học' ||
          updateStudentDto.status === 'Tạm dừng học')
      ) {
        throw new BadRequestException(
          `Invalid status transition: cannot change from "Đã tốt nghiệp" to "Đang học"`,
        );
      }
    }
    const updatedStudent = await this.prisma.student.update({
      where: { mssv: id.toString() },
      data: {
        ...updateStudentDto,
        dob: updateStudentDto.dob
          ? new Date(updateStudentDto.dob).toLocaleString('vi-VN')
          : existing.dob,
      },
    });
    this.logger.log(`Student updated: ${id}`);
    return {
      message: 'Student updated successfully',
      student: updatedStudent,
    };
  }

  async remove(id: number): Promise<{ message: string }> {
    await this.prisma.student.delete({ where: { mssv: id.toString() } });
    this.logger.log(`Student deleted: ${id}`);
    return { message: 'Student deleted successfully' };
  }
}
