import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private mapProfileRow(account: any) {
    if (!account) return null;
    return {
      id: account.id,
      walletAddress: account.address,
      roleCode: account.roleCode,
      displayName: account.displayName,
      phoneNumber: account.phoneNumber,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async createProfile(custodianAddress: string, data: {
    roleCode: string;
    displayName: string;
    phoneNumber?: string;
  }) {
    const addr = (custodianAddress || '').trim();
    const isPayment =
      /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);
    if (!isPayment) {
      throw new BadRequestException(
        `Invalid wallet address. Please use a payment address (addr... / addr_test...). Received: ${custodianAddress}`,
      );
    }

    const roleCode = (data.roleCode || '').trim().toUpperCase();
    if (!roleCode) throw new BadRequestException('Role is required.');
    const role = await (this.prisma as any).role.findUnique({ where: { code: roleCode } });
    if (!role) throw new BadRequestException('Invalid role.');
    const displayName = (data.displayName || '').trim();
    if (!displayName) throw new BadRequestException('Display name is required.');
    const phoneNumber = (data.phoneNumber || '').trim() || null;
    const existing = await (this.prisma as any).user.findUnique({
      where: { address: addr },
      select: { roleCode: true },
    });
    if (existing?.roleCode && existing.roleCode !== roleCode) {
      throw new BadRequestException('Role cannot be changed after profile creation.');
    }
    const account = await (this.prisma as any).user.update({
      where: { address: addr },
      data: {
        roleCode: existing?.roleCode || roleCode,
        displayName,
        phoneNumber,
        isActive: true,
      } as any,
      select: {
        id: true,
        address: true,
        roleCode: true,
        displayName: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    });

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    const payload = {
      sub: addr,
      stakeAddress: addr,
      profileId: account.id,
      role: account.roleCode,
      displayName: account.displayName,
      phoneNumber: account.phoneNumber,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      profile: this.mapProfileRow(account),
    };
  }

  async updateProfile(accountId: string, data: {
    displayName?: string;
    phoneNumber?: string;
  }) {
    const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
    const phoneNumber =
      typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() || null : undefined;
    if (!displayName) {
      throw new BadRequestException('Display name is required.');
    }

    const account = await (this.prisma as any).user.update({
      where: { id: accountId },
      data: {
        displayName,
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
      } as any,
      select: {
        id: true,
        roleCode: true,
        displayName: true,
        phoneNumber: true,
      } as any,
    });

    return this.mapProfileRow(account);
  }

  async getRoles() {
    const roles = await (this.prisma as any).role.findMany({
      orderBy: { code: 'asc' },
      select: { code: true, name: true },
    });
    return (Array.isArray(roles) ? roles : []).map((r: any, idx: number) => ({
      id: idx + 1,
      code: r.code,
      name: r.name ?? null,
    }));
  }

  async listProfiles(custodianAddress: string) {
    const addr = (custodianAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Account reference is required.');
    }

    const account = await (this.prisma as any).user.findUnique({
      where: { address: addr },
      select: {
        id: true,
        address: true,
        roleCode: true,
        displayName: true,
        phoneNumber: true,
        isActive: true,
      } as any,
    });
    if (!account || !account.roleCode) return [];
    return [this.mapProfileRow(account)];
  }

  async getProfileById(accountId: string) {
    const account = await (this.prisma as any).user.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        address: true,
        roleCode: true,
        displayName: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    });
    if (!account || !account.roleCode) {
      throw new BadRequestException('Profile not found.');
    }
    return this.mapProfileRow(account);
  }

  async getPublicProfile(custodianAddress: string) {
    const addr = (custodianAddress || '').trim();
    const isPayment =
      /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);
    if (!isPayment) {
      throw new BadRequestException(
        `Invalid wallet address. Please use a payment address (addr... / addr_test...). Received: ${custodianAddress}`,
      );
    }

    const account = await (this.prisma as any).user.findUnique({
      where: { address: addr },
      select: {
        address: true,
        roleCode: true,
        displayName: true,
        phoneNumber: true,
        isActive: true,
      } as any,
    });

    return {
      profile: account && account.isActive && account.roleCode
        ? {
            walletAddress: account.address,
            roleCode: account.roleCode,
            displayName: account.displayName,
            phoneNumber: account.phoneNumber,
            isActive: account.isActive,
          }
        : null,
    };
  }
}
