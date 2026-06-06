import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';
import { checkSignature } from '@meshsdk/core';

export interface StakeAddressInput {
  address?: string;
}

@Injectable()
export class AuthService {
  private readonly blockfrost: BlockFrostAPI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const projectId = this.config.get<string>('BLOCKFROST_API_KEY') || process.env.BLOCKFROST_API_KEY || '';
    if (!projectId) {
      this.blockfrost = null as any;
    } else {
      this.blockfrost = new BlockFrostAPI({
        projectId,
        network: this.config.get<string>('APP_NETWORK') === 'mainnet' ? 'mainnet' : 'preprod',
      });
    }
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

  async generateNonce(stakeAddress: string): Promise<string> {
    const input = this.normalizeStakeAddress(stakeAddress);

    if (!this.isSupportedAddress(input)) {
      throw new BadRequestException(
        `Địa chỉ ví không hợp lệ. Dùng địa chỉ thanh toán (addr... / addr_test...) hoặc stake (stake... / stake_test...). Nhận được: ${stakeAddress}`,
      );
    }

    const nonce = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await (this.prisma as any).walletNonce.upsert({
      where: { address: input },
      create: {
        address: input,
        nonce,
        expiresAt,
        usedAt: null,
      } as any,
      update: {
        nonce,
        expiresAt,
        usedAt: null,
      } as any,
    });

    return nonce;
  }

  async verifyAndIssueToken(data: {
    stakeAddress: string;
    nonce: string;
    signature: string;
    key: string;
  }) {
    const input = this.normalizeStakeAddress(data.stakeAddress);

    if (!this.isSupportedAddress(input)) {
      throw new BadRequestException(
        `Địa chỉ ví không hợp lệ. Dùng địa chỉ thanh toán (addr... / addr_test...) hoặc stake (stake... / stake_test...). Nhận được: ${data.stakeAddress}`,
      );
    }

    const stored = await (this.prisma as any).walletNonce.findUnique({
      where: { address: input },
      select: { nonce: true, expiresAt: true, usedAt: true },
    });
    const expMs = stored?.expiresAt ? new Date(stored.expiresAt).getTime() : 0;
    if (!stored || stored.usedAt || String(stored.nonce || '') !== String(data.nonce || '') || expMs < Date.now()) {
      throw new UnauthorizedException('Nonce không hợp lệ hoặc đã hết hạn.');
    }

    if (!data.signature || !data.key) {
      throw new UnauthorizedException('Thiếu chữ ký hoặc khóa công khai.');
    }

    const signatureValid = this.verifyWalletSignature(String(stored.nonce || ''), data.signature, data.key);
    if (!signatureValid) {
      throw new UnauthorizedException('Chữ ký ví không hợp lệ.');
    }

    await (this.prisma as any).walletNonce.update({
      where: { address: input },
      data: { usedAt: new Date() } as any,
    });

    const paymentAddr = await this.resolvePaymentAddress(input);
    if (!this.isPaymentAddress(paymentAddr)) {
      throw new BadRequestException(
        `Không chuyển được sang địa chỉ thanh toán. Dùng addr... / addr_test..., hoặc cấu hình BLOCKFROST_API_KEY để resolve stake → payment. Nhận được: ${data.stakeAddress}`,
      );
    }

    await (this.prisma as any).user.upsert({
      where: { address: paymentAddr },
      update: { lastLogin: new Date() },
      create: {
        address: paymentAddr,
        lastLogin: new Date(),
      },
    });

    const account = await (this.prisma as any).user.findUnique({
      where: { address: paymentAddr },
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
      throw new UnauthorizedException('Chưa cấu hình JWT_SECRET trên server.');
    }

    if (!account?.roleCode) {
      const setupPayload = {
        sub: paymentAddr,
        stakeAddress: input,
        paymentAddress: paymentAddr,
      };

      const setupToken = jwt.sign(setupPayload, secret, { expiresIn: '7d' });

      return {
        needProfile: true,
        roles: await this.getRoles(),
        token: setupToken,
      };
    }

    const payload = {
      sub: paymentAddr,
      stakeAddress: input,
      paymentAddress: paymentAddr,
      profileId: account.id,
      role: account.roleCode,
      displayName: account.displayName,
      phoneNumber: account.phoneNumber,
      walletAddress: account.address,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      profile: {
        id: account.id,
        walletAddress: account.address,
        roleCode: account.roleCode,
        displayName: account.displayName,
        phoneNumber: account.phoneNumber,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    };
  }

  private normalizeStakeAddress(address: string): string {
    const raw = (address || '').trim();
    if (!raw) return raw;

    if (/^(0x)?[0-9a-fA-F]+$/.test(raw) && raw.length > 60) {
      try {
        const hex = raw.startsWith('0x') ? raw.slice(2) : raw;
        const bytes = Buffer.from(hex, 'hex');
        return CSL.Address.from_bytes(bytes).to_bech32();
      } catch {
        return raw;
      }
    }

    return raw;
  }

  private isStakeAddress(address: string): boolean {
    return /^stake1[0-9a-z]+$/.test(address) || /^stake_test1[0-9a-z]+$/.test(address);
  }

  private isSupportedAddress(address: string): boolean {
    return this.isPaymentAddress(address) || this.isStakeAddress(address);
  }

  private isPaymentAddress(address: string): boolean {
    if (!address) return false;
    if (this.isStakeAddress(address)) return false;
    return (
      /^addr1[0-9a-z]+$/.test(address) ||
      /^addr_test1[0-9a-z]+$/.test(address)
    );
  }

  private async resolvePaymentAddress(input: string): Promise<string> {
    const addr = input;
    if (this.isPaymentAddress(addr)) return addr;

    if (this.isStakeAddress(addr)) {
      if (!this.blockfrost) {
        throw new BadRequestException(
          'Không resolve stake sang địa chỉ thanh toán: server chưa cấu hình BLOCKFROST_API_KEY.',
        );
      }
      const addresses = await this.blockfrost.accountsAddresses(addr as any);
      const first = addresses?.[0]?.address;
      if (!first) {
        throw new BadRequestException('Không tìm thấy địa chỉ thanh toán cho stake này.');
      }
      return first;
    }

    return addr;
  }

  private resolveWalletAddress(jwtUser: any): string {
    return String(
      jwtUser?.paymentAddress || jwtUser?.walletAddress || jwtUser?.sub || '',
    ).trim();
  }

  async getMe(jwtUser: any) {
    const addr = this.resolveWalletAddress(jwtUser);
    if (!addr) {
      return { user: jwtUser ?? null, profile: null };
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
      },
    });

    if (!account?.roleCode) {
      return {
        user: {
          ...jwtUser,
          sub: addr,
          paymentAddress: addr,
          walletAddress: addr,
          profileId: null,
          role: null,
          roleCode: null,
        },
        profile: null,
      };
    }

    const user = {
      sub: addr,
      stakeAddress: jwtUser?.stakeAddress || addr,
      paymentAddress: addr,
      walletAddress: addr,
      profileId: account.id,
      role: account.roleCode,
      roleCode: account.roleCode,
      displayName: account.displayName,
      phoneNumber: account.phoneNumber,
      isActive: account.isActive,
    };

    return {
      user,
      profile: {
        id: account.id,
        walletAddress: account.address,
        roleCode: account.roleCode,
        displayName: account.displayName,
        phoneNumber: account.phoneNumber,
      },
    };
  }

  buildSessionToken(account: {
    id: string;
    address: string;
    roleCode: string;
    displayName?: string | null;
    phoneNumber?: string | null;
    isActive?: boolean;
  }) {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Chưa cấu hình JWT_SECRET trên server.');
    }
    return jwt.sign(
      {
        sub: account.address,
        stakeAddress: account.address,
        paymentAddress: account.address,
        walletAddress: account.address,
        profileId: account.id,
        role: account.roleCode,
        displayName: account.displayName,
        phoneNumber: account.phoneNumber,
        isActive: account.isActive,
      },
      secret,
      { expiresIn: '7d' },
    );
  }

  private verifyWalletSignature(nonce: string, signature: string, key: string): boolean {
    try {
      if (checkSignature(nonce, { signature, key } as any)) return true;
      const nonceHex = Buffer.from(nonce, 'utf8').toString('hex');
      if (checkSignature(nonceHex, { signature, key } as any)) return true;
      return false;
    } catch {
      return false;
    }
  }
}