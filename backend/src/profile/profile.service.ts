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

  async createProfile(custodianAddress: string, data: {
    roleCode: string;
    displayName: string;
    location?: string;
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

    const location = (data.location || '').trim();
    if (!location) {
      throw new BadRequestException('Location is required.');
    }
    const account = await (this.prisma as any).custodianAccount.update({
      where: { address: addr },
      data: {
        roleCode,
        displayName: data.displayName,
        location,
        isActive: true,
      } as any,
      select: {
        id: true,
        address: true,
        roleCode: true,
        displayName: true,
        location: true,
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
      location: account.location,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      profile: {
        id: account.id,
        role: account.roleCode,
        displayName: account.displayName,
        location: account.location,
      },
    };
  }

  async updateProfile(accountId: string, data: {
    displayName?: string;
    location?: string;
  }) {
    const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
    const location = typeof data.location === 'string' ? data.location.trim() : '';
    if (!displayName) {
      throw new BadRequestException('Display name is required.');
    }
    if (!location) {
      throw new BadRequestException('Location is required.');
    }

    const account = await (this.prisma as any).custodianAccount.update({
      where: { id: accountId },
      data: {
        displayName,
        location,
      } as any,
      select: {
        id: true,
        roleCode: true,
        displayName: true,
        location: true,
      } as any,
    });

    return {
      id: account.id,
      role: account.roleCode,
      displayName: account.displayName,
      location: account.location,
    };
  }

  async listProfiles(custodianAddress: string) {
    const addr = (custodianAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Account reference is required.');
    }

    const account = await (this.prisma as any).custodianAccount.findUnique({
      where: { address: addr },
      select: {
        id: true,
        address: true,
        roleCode: true,
        displayName: true,
        location: true,
        isActive: true,
      } as any,
    });
    if (!account || !account.roleCode) return [];
    return [
      {
        id: account.id,
        walletAddress: account.address,
        roleCode: account.roleCode,
        displayName: account.displayName,
        location: account.location,
        isActive: account.isActive,
      },
    ];
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

    const account = await (this.prisma as any).custodianAccount.findUnique({
      where: { address: addr },
      select: {
        address: true,
        roleCode: true,
        displayName: true,
        location: true,
        isActive: true,
      } as any,
    });

    return {
      profile: account && account.isActive && account.roleCode
        ? {
            walletAddress: account.address,
            roleCode: account.roleCode,
            displayName: account.displayName,
            location: account.location,
            isActive: account.isActive,
          }
        : null,
    };
  }
}
