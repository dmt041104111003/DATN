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

  async createProfile(walletAddress: string, data: {
    roleCode: string;
    displayName: string;
    location?: string;
  }) {
    const addr = (walletAddress || '').trim();
    const isPayment =
      /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);
    if (!isPayment) {
      throw new BadRequestException(
        `Invalid wallet address. Please use a payment address (addr... / addr_test...). Received: ${walletAddress}`,
      );
    }

    const existingProfile = await this.prisma.profile.findFirst({
      where: {
        walletAddress: addr,
        roleCode: data.roleCode,
      },
    });

    if (existingProfile) {
      throw new BadRequestException('Profile already exists for this role');
    }

    const location = (data.location || '').trim();
    if (!location) {
      throw new BadRequestException('Location is required.');
    }

    const profile = await this.prisma.profile.create({
      data: {
        walletAddress: addr,
        roleCode: data.roleCode,
        displayName: data.displayName,
        location,
      },
    });

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    const payload = {
      sub: addr,
      stakeAddress: addr,
      profileId: profile.id,
      role: profile.roleCode,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      profile: {
        id: profile.id,
        role: profile.roleCode,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
      },
    };
  }

  async updateProfile(profileId: string, data: {
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

    const profile = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        displayName,
        location,
      },
    });

    return {
      id: profile.id,
      role: profile.roleCode,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
    };
  }

  async listProfiles(walletAddress: string) {
    const addr = (walletAddress || '').trim();
    if (!addr) {
      throw new BadRequestException('Wallet address is required');
    }

    const profiles = await this.prisma.profile.findMany({
      where: {
        isActive: true,
        walletAddress: addr,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        walletAddress: true,
        roleCode: true,
        displayName: true,
        location: true,
        isActive: true,
      },
    });

    return profiles;
  }

  async getPublicProfile(walletAddress: string) {
    const addr = (walletAddress || '').trim();
    const isPayment =
      /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);
    if (!isPayment) {
      throw new BadRequestException(
        `Invalid wallet address. Please use a payment address (addr... / addr_test...). Received: ${walletAddress}`,
      );
    }

    const profile = await this.prisma.profile.findFirst({
      where: { walletAddress: addr, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        walletAddress: true,
        roleCode: true,
        displayName: true,
        location: true,
        isActive: true,
      },
    });

    return { profile: profile || null };
  }
}
