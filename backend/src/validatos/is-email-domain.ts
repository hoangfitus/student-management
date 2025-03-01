import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailDomainConstraint implements ValidatorConstraintInterface {
  constructor(private readonly configService: ConfigService) {}

  validate(email: string) {
    const allowedDomain = this.configService.get<string>(
      'ALLOWED_EMAIL_DOMAIN',
    );
    if (!allowedDomain) return false; // Nếu chưa cấu hình domain, từ chối luôn
    const emailDomain = email.split('@')[1];
    return emailDomain === allowedDomain;
  }

  defaultMessage() {
    return 'Email must belong to the configured domain';
  }
}

export function IsEmailDomain(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailDomainConstraint,
    });
  };
}
