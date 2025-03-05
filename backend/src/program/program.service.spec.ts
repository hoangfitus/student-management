import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from './program.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('ProgramService', () => {
  let service: ProgramService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramService, PrismaService, Logger],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a program', async () => {
      const dto = {
        name: 'New Program',
      };
      const result = {
        message: 'Program created successfully',
        program: {
          id: 1,
          name: 'New Program',
        },
      };
      jest
        .spyOn(prismaService.program, 'create')
        .mockResolvedValue(result.program);

      expect(await service.create(dto)).toEqual(result);
    });
  });

  describe('findAll', () => {
    it('should return a list of programs', async () => {
      const result = [
        {
          id: 1,
          name: 'Test Program',
        },
      ];
      jest.spyOn(prismaService.program, 'findMany').mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a program', async () => {
      const dto = {
        name: 'Updated Program',
      };
      const result = {
        message: 'Program updated successfully',
        program: {
          id: 1,
          name: 'Updated Program',
        },
      };
      jest
        .spyOn(prismaService.program, 'update')
        .mockResolvedValue(result.program);

      expect(await service.update(1, dto)).toEqual(result);
    });
  });

  describe('remove', () => {
    it('should remove a program', async () => {
      const result = { message: 'Program deleted successfully' };
      jest
        .spyOn(prismaService.program, 'delete')
        .mockResolvedValue(result as any);

      expect(await service.remove(1)).toEqual(result);
    });
  });
});
