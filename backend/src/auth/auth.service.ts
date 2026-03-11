import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

export interface StakeAddressInput {
  address?: string;
}

@Injectable()
export class AuthService {
  private readonly nonceStore = new Map<string, { nonce: string; expMs: number }>();
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

  generateNonce(stakeAddress: string): string {
    const network = this.config.get<string>('APP_NETWORK') === 'mainnet' ? 'mainnet' : 'preprod';
    const input = this.normalizeStakeAddress(stakeAddress, network);

    if (!this.isSupportedAddress(input)) {
      throw new BadRequestException(
        `Invalid address format. Please provide a payment address (addr... / addr_test...) or a stake address (stake... / stake_test...). Received: ${stakeAddress}`,
      );
    }

    const nonce = randomBytes(32).toString('hex');
    this.nonceStore.set(input, {
      nonce,
      expMs: Date.now() + 5 * 60 * 1000,
    });

    return nonce;
  }

  async verifyAndIssueToken(data: {
    stakeAddress: string;
    nonce: string;
    signature: string;
    key: string;
  }) {
    const network = this.config.get<string>('APP_NETWORK') === 'mainnet' ? 'mainnet' : 'preprod';
    const input = this.normalizeStakeAddress(data.stakeAddress, network);

    if (!this.isSupportedAddress(input)) {
      throw new BadRequestException(
        `Invalid address format. Please provide a payment address (addr... / addr_test...) or a stake address (stake... / stake_test...). Received: ${data.stakeAddress}`,
      );
    }

    const storedNonce = this.nonceStore.get(input);
    if (!storedNonce || storedNonce.nonce !== data.nonce || storedNonce.expMs < Date.now()) {
      throw new UnauthorizedException('Invalid or expired nonce.');
    }

    this.nonceStore.delete(input);

    if (!data.signature || !data.key) {
      throw new UnauthorizedException('Missing signature or public key.');
    }

    const paymentAddr = await this.resolvePaymentAddress(input, network);
    if (!this.isPaymentAddress(paymentAddr)) {
      throw new BadRequestException(
        `Could not resolve to a payment address. Please provide a payment address (addr... / addr_test...), or configure BLOCKFROST_API_KEY to resolve stake -> payment. Received: ${data.stakeAddress}`,
      );
    }

    await this.prisma.wallet.upsert({
      where: { address: paymentAddr },
      update: { lastLogin: new Date() },
      create: { 
        address: paymentAddr, 
        lastLogin: new Date() 
      },
    });

    const profile = await this.prisma.profile.findFirst({
      where: { walletAddress: paymentAddr },
    });

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    if (!profile) {
      const setupPayload = {
        sub: paymentAddr,
        stakeAddress: input,
        paymentAddress: paymentAddr,
      };

      const setupToken = jwt.sign(setupPayload, secret, { expiresIn: '7d' });

      return {
        needProfile: true,
        roles: [
          { id: 1, code: "ENTERPRISE" },
          { id: 2, code: "TRANSIT" },
          { id: 3, code: "AGENT" },
        ],
        token: setupToken,
      };
    }

    const payload = {
      sub: paymentAddr,
      stakeAddress: input,
      paymentAddress: paymentAddr,
      profileId: profile.id,
      role: profile.roleCode,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      walletAddress: profile.walletAddress,
      location: profile.location,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return {
      token,
      profile: {
        id: profile.id,
        walletAddress: profile.walletAddress,
        roleCode: profile.roleCode,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        location: profile.location,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    };
  }

  private normalizeStakeAddress(address: string, _network: 'mainnet' | 'preprod'): string {
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

  private async resolvePaymentAddress(input: string, network: 'mainnet' | 'preprod'): Promise<string> {
    const addr = this.normalizeStakeAddress(input, network);
    if (this.isPaymentAddress(addr)) return addr;

    if (this.isStakeAddress(addr)) {
      if (!this.blockfrost) {
        throw new BadRequestException(
          'Cannot resolve stake address to payment address: BLOCKFROST_API_KEY is not configured on backend.',
        );
      }
      const addresses = await this.blockfrost.accountsAddresses(addr as any);
      const first = addresses?.[0]?.address;
      if (!first) {
        throw new BadRequestException('No payment addresses found for this stake address.');
      }
      return first;
    }

    return addr;
  }
}
