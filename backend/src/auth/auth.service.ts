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
    if (!address || typeof address !== 'string') {
      throw new UnauthorizedException('Invalid address');
    }
    const normalizedAddress = address.trim().toLowerCase();
    const nonce = generateNonce('I agree to the term and conditions of the Mesh: ');

    await this.prisma.walletNonce.upsert({
      where: { address: normalizedAddress },
      update: { nonce },
      create: { address: normalizedAddress, nonce },
    });

    return { nonce };
  }

  async verifyWallet(address: string, signature: string, key: string) {
    if (!address || !signature || !key || typeof address !== 'string' || typeof signature !== 'string' || typeof key !== 'string') {
      throw new UnauthorizedException('Invalid input');
    }

    const userAddress = address.trim();
    const normalizedAddress = userAddress.toLowerCase();
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

  private verifySignature(nonce: string, signature: string, key: string, address: string): boolean {
    try {
      const userAddress = address.trim();
      if (!userAddress || userAddress.length === 0) {
        return false;
      }
      return checkSignature(nonce, { signature, key }, userAddress);
    } catch (error) {
      console.error('Signature verification error:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
