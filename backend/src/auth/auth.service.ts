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

  // Tạo nonce cho address
  async getNonce(address: string) {
    const nonce = randomBytes(32).toString('hex');

    // Lưu hoặc update nonce
    await this.prisma.walletNonce.upsert({
      where: { address },
      update: { nonce },
      create: { address, nonce },
    });

    return { nonce };
  }

  // Verify signature và tạo JWT
  async verifyWallet(address: string, signature: string, key: string) {
    // Lấy nonce từ DB
    const walletNonce = await this.prisma.walletNonce.findUnique({
      where: { address },
    });

    if (!walletNonce) {
      throw new UnauthorizedException('Nonce not found. Get nonce first.');
    }

    // Verify signature (dùng thư viện Cardano)
    const isValid = await this.verifySignature(walletNonce.nonce, signature, key, address);

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Tạo hoặc lấy user
    let user = await this.prisma.user.findUnique({ where: { address } });
    
    if (!user) {
      user = await this.prisma.user.create({ data: { address } });
    }

    // Xóa nonce đã dùng
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

  // Verify Cardano signature
  private async verifySignature(
    nonce: string,
    signature: string,
    key: string,
    address: string,
  ): Promise<boolean> {
    try {
      return await checkSignature(nonce, { signature, key }, address);
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