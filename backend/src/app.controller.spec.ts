import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [Logger],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getBuildInfo', () => {
    it('should return the build info', () => {
      expect(appController.getBuildInfo()).toBeDefined();
    });
  });
});
