import { Injectable, Logger } from '@nestjs/common';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  create(createConfigDto: CreateConfigDto) {
    this.logger.log('Creating config');
    return this.prisma.config.create({
      data: createConfigDto,
    });
  }

  findAll() {
    this.logger.log('Fetching all configs');
    return this.prisma.config.findMany();
  }

  update(id: number, updateConfigDto: UpdateConfigDto) {
    this.logger.log('Updating config');
    return this.prisma.config.update({
      where: { id },
      data: updateConfigDto,
    });
  }

  findByName(name: string) {
    this.logger.log(`Fetching config by name: ${name}`);
    return this.prisma.config.findUnique({
      where: { name },
    });
  }
}
