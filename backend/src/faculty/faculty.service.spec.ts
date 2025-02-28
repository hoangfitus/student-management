import { Test, TestingModule } from '@nestjs/testing';
import { FacultyService } from './faculty.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('FacultyService', () => {
  let service: FacultyService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyService, PrismaService, Logger],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return faculties array', async () => {
      jest.spyOn(prismaService.faculty, 'count').mockResolvedValueOnce(2);
      const fakeFaculties = [
        {
          id: 1,
          name: 'Khoa CNTT',
        },
        {
          id: 2,
          name: 'Khoa Điện tử viễn thông',
        },
      ];
      jest
        .spyOn(prismaService.faculty, 'findMany')
        .mockResolvedValueOnce(fakeFaculties);

      const result = await service.findAll();
      expect(result).toEqual(fakeFaculties);
    });
  });

  describe('create', () => {
    it('should return a faculty', async () => {
      const dto = {
        name: 'Khoa Van',
      };
      const result = {
        message: 'Faculty created successfully',
        faculty: {
          id: 1,
          name: 'Khoa Van',
        },
      };
      jest
        .spyOn(prismaService.faculty, 'create')
        .mockResolvedValue(result.faculty);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should return a faculty', async () => {
      const dto = {
        name: 'Khoa CNTT',
      };
      const result = {
        message: 'Faculty updated successfully',
        faculty: {
          id: 1,
          name: 'Khoa CNTT',
        },
      };
      jest
        .spyOn(prismaService.faculty, 'update')
        .mockResolvedValue(result.faculty);

      expect(await service.update(1, dto)).toEqual(result);
    });
  });
});
