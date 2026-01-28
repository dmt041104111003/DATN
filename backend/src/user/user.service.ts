import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpsertAgentDto } from './dto/upsert-agent.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private async getRoleCode(userId: string): Promise<'ENTERPRISE' | 'AGENT' | null> {
    const roles = await (this.prisma as any).userRole.findMany({
      where: { userId },
      select: { role: { select: { code: true } } },
    });
    if (!roles || roles.length === 0) return null;
    return roles[0].role.code;
  }

  private async assertEnterprise(userId: string) {
    const role = await this.getRoleCode(userId);
    if (role !== 'ENTERPRISE') throw new BadRequestException('Enterprise role required');
  }

  async findOne(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.redis.set(cacheKey, user, 300);
    return user;
  }

  async listAgents(enterpriseUserId: string) {
    await this.assertEnterprise(enterpriseUserId);
    const cacheKey = 'agents:all';
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const agents = await (this.prisma as any).userRole.findMany({
      where: { role: { code: 'AGENT' } },
      select: {
        user: {
          select: {
            id: true,
            address: true,
            walletName: true,
            displayName: true,
            location: true,
            gpsLatitude: true,
            gpsLongitude: true,
          },
        },
      },
    });
    const result = agents.map((r: any) => r.user);
    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async upsertAgent(enterpriseUserId: string, dto: UpsertAgentDto) {
    await this.assertEnterprise(enterpriseUserId);

    const address = dto.walletAddress.trim();
    const agentUser = await this.prisma.user.upsert({
      where: { address },
      update: {},
      create: { address },
    });

    const agentRole = await this.getRoleCode(agentUser.id);
    if (agentRole === 'ENTERPRISE') {
      throw new BadRequestException('Cannot add enterprise as agent');
    }

    if (!agentRole) {
      const role = await (this.prisma as any).role.findUnique({
        where: { code: 'AGENT' },
        select: { id: true },
      });
      if (!role) throw new BadRequestException('Role not seeded');

      await (this.prisma as any).userRole.create({
        data: { userId: agentUser.id, roleId: role.id },
      });
    }

    const updated = await (this.prisma as any).user.update({
      where: { id: agentUser.id },
      data: {
        displayName: dto.displayName,
        location: dto.location,
        gpsLatitude: dto.gpsLatitude,
        gpsLongitude: dto.gpsLongitude,
      },
    });

    await this.redis.delMultiple([
      `user:${agentUser.id}`,
      'agents:all',
      'users:all',
    ]);

    return updated;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const updated = await this.prisma.user.update({ where: { id }, data: dto });
    await this.redis.delMultiple([`user:${id}`, 'users:all']);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.user.delete({ where: { id } });
    await this.redis.delMultiple([`user:${id}`, 'users:all', 'agents:all']);
    return deleted;
  }
}
