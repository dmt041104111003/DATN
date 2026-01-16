import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';
import { checkSignature } from '@meshsdk/core';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string) {
    const nonce = randomBytes(32).toString('hex');

    await this.prisma.walletNonce.upsert({
      where: { address },
      update: { nonce },
      create: { address, nonce },
    });

    return { nonce };
  }

  async verifyWallet(address: string, signature: string, key: string) {
    const walletNonce = await this.prisma.walletNonce.findUnique({
      where: { address },
    });

    if (!walletNonce) {
      throw new UnauthorizedException('Nonce not found. Get nonce first.');
    }

    const isValid = this.verifySignature(
      walletNonce.nonce,
      signature,
      key,
      address,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.prisma.user.findUnique({ where: { address } });

    if (!user) {
      user = await this.prisma.user.create({ data: { address } });
    }

    await this.prisma.walletNonce.delete({ where: { address } });

    // Tạo JWT
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

  private verifySignature(
    nonce: string,
    signature: string,
    key: string,
    address: string,
  ): boolean {
    try {
      return checkSignature(nonce, { signature, key }, address);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Lấy user từ JWT token
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
