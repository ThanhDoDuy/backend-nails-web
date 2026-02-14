import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-super-admin-key'];

    if (!apiKey || apiKey !== this.configService.get<string>('SUPER_ADMIN_KEY')) {
      throw new UnauthorizedException('Invalid super admin key');
    }

    return true;
  }
}
