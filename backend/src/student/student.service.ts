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
  private readonly ALLOWED_STATUS_TRANSITIONS = {
    'Đang học': ['Đã tốt nghiệp', 'Đã thôi học', 'Tạm dừng học'],
    'Đã tốt nghiệp': ['Đã thôi học'],
  };

  private readonly DELETE_TIME_LIMIT = 30; // minutes

  constructor(
    private prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(
    createStudentDto: CreateStudentDto,
  ): Promise<{ message: string; student: Student }> {
    try {
      const student = await this.prisma.student.create({
        data: createStudentDto,
      });

      this.logger.log(`Student created: ${student.name}`);
      return {
        message: 'Student created successfully',
        student,
      };
    } catch (error) {
      this.handlePrismaError(error, 'creating');
    }
  }

  async findAll(
    search: string,
    faculty: string,
    page: number,
    limit: number,
  ): Promise<{ total: number; students: Student[] }> {
    try {
      const whereClause = this.buildWhereClause(search, faculty);

      const [students, total] = await Promise.all([
        this.prisma.student.findMany({
          where: whereClause,
          take: limit,
          skip: page * limit,
          orderBy: { mssv: 'asc' },
        }),
        this.prisma.student.count({ where: whereClause }),
      ]);

      this.logger.log('Fetching all students');
      return { total, students };
    } catch (error) {
      this.handlePrismaError(error, 'fetching');
    }
  }

  async update(
    id: number,
    updateStudentDto: UpdateStudentDto,
  ): Promise<{ message: string; student: Student }> {
    try {
      const existing = await this.findStudentOrThrow(id);

      if (updateStudentDto.status) {
        this.validateStatusTransition(existing.status, updateStudentDto.status);
      }

      const updatedStudent = await this.prisma.student.update({
        where: { mssv: id.toString() },
        data: this.formatUpdateData(updateStudentDto, existing),
      });

      this.logger.log(`Student updated: ${id}`);
      return {
        message: 'Student updated successfully',
        student: updatedStudent,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handlePrismaError(error, 'updating');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const student = await this.findStudentOrThrow(id);
      this.validateDeletionTimeLimit(student.createdAt);

      await this.prisma.student.delete({
        where: { mssv: id.toString() },
      });

      this.logger.log(`Student deleted: ${id}`);
      return { message: 'Student deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.handlePrismaError(error, 'deleting');
    }
  }

  private buildWhereClause(
    search: string,
    faculty: string,
  ): Prisma.StudentWhereInput {
    const whereClause: Prisma.StudentWhereInput = {
      OR: [
        { mssv: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ],
    };

    if (faculty?.trim()) {
      whereClause.faculty = { contains: faculty, mode: 'insensitive' };
    }

    return whereClause;
  }

  private async findStudentOrThrow(id: number): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { mssv: id.toString() },
    });

    if (!student) {
      this.logger.error(`Student with MSSV ${id} not found`);
      throw new NotFoundException(`Student with MSSV ${id} not found`);
    }

    return student;
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const allowedTransitions = this.ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (allowedTransitions && !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
      );
    }
  }

  private validateDeletionTimeLimit(createdAt: Date): void {
    const diffInMinutes =
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000;

    if (diffInMinutes > this.DELETE_TIME_LIMIT) {
      throw new BadRequestException(
        `Cannot delete student after ${this.DELETE_TIME_LIMIT} minutes from creation`,
      );
    }
  }

  private formatUpdateData(
    updateDto: UpdateStudentDto,
    existing: Student,
  ): Prisma.StudentUpdateInput {
    return {
      ...updateDto,
      dob: updateDto.dob
        ? new Date(updateDto.dob).toLocaleString('vi-VN')
        : existing.dob,
    };
  }

  private handlePrismaError(error: any, operation: string): never {
    if (error.code === 'P2002' && error.meta?.target) {
      const target = error.meta.target.join(', ');
      this.logger.error(
        `Error ${operation} student: ${target} already exists`,
        error.stack,
      );
      throw new BadRequestException(`Student with ${target} already exists`);
    }

    this.logger.error(
      `Error ${operation} student: ${error.message}`,
      error.stack,
    );
    throw new BadRequestException(
      `Error ${operation} student: ${error.message}`,
    );
  }
}
