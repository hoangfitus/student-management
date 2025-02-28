import { Controller, Get, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Get('build')
  async getBuildInfo() {
    const versionFilePath = path.join(__dirname, '..', '..', 'version.json');
    try {
      const data = await fs.promises.readFile(versionFilePath, 'utf8');
      const versionData = JSON.parse(data);
      this.logger.log('Version data retrieved');
      return versionData;
    } catch (err) {
      this.logger.error(err.message);
      return { error: err.message };
    }
  }
}
