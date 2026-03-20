import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export class EnterpriseOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const role = req.user?.role ?? req.user?.roleCode;
    if (role !== 'ENTERPRISE') {
      throw new ForbiddenException('Forbidden');
    }
    return true;
  }
}

