import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { generateNonce, checkSignature } from '@meshsdk/core';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string) {
    const normalizedAddress = this.normalizeAddress(address);
    const nonce = generateNonce('I agree to the term and conditions of the Mesh: ');

    await this.prisma.walletNonce.upsert({
      where: { address: normalizedAddress },
      update: { nonce },
      create: { address: normalizedAddress, nonce },
    });

    return { nonce };
  }

  async verifyWallet(address: string, signature: string, key: string) {
    const userAddress = address.trim();
    const normalizedAddress = this.normalizeAddress(address);
    const walletNonce = await this.prisma.walletNonce.findUnique({
      where: { address: normalizedAddress },
    });

    if (!walletNonce) {
      throw new UnauthorizedException('Nonce not found. Get nonce first.');
    }

    if (!this.verifySignature(walletNonce.nonce, signature, key, userAddress)) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.prisma.user.findUnique({ where: { address: normalizedAddress } });
    if (!user) {
      user = await this.prisma.user.create({ data: { address: normalizedAddress } });
    }

    const newNonce = generateNonce('I agree to the term and conditions of the Mesh: ');
    await this.prisma.walletNonce.update({
      where: { address: normalizedAddress },
      data: { nonce: newNonce },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      address: user.address,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        address: user.address,
      },
    };
  }

  private normalizeAddress(address: string): string {
    return address.trim().toLowerCase();
  }

  private verifySignature(nonce: string, signature: string, key: string, address: string): boolean {
    try {
      return checkSignature(nonce, { signature, key }, address.trim());
    } catch (error) {
      console.error('Signature verification error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
