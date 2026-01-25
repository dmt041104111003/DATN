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
    const userAddress = address.trim();
    const nonce = generateNonce('I agree to the term and conditions of the HSUPPLY: ');

    let user = await this.prisma.user.findUnique({ where: { address: userAddress } });
    if (!user) {
      user = await this.prisma.user.create({ data: { address: userAddress } });
    }

    await this.prisma.walletNonce.upsert({
      where: { address: userAddress },
      update: { nonce, userId: user.id },
      create: { address: userAddress, nonce, userId: user.id },
    });

    return { nonce };
  }

  async verifyWallet(address: string, signature: string, key: string, walletName: string) {
    const userAddress = address.trim();
    const walletNonce = await this.prisma.walletNonce.findUnique({
      where: { address: userAddress },
    });

    if (!walletNonce) {
      throw new UnauthorizedException('Nonce not found. Get nonce first.');
    }

    const isValid = checkSignature(walletNonce.nonce, { signature, key }, userAddress);
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    let user = await this.prisma.user.findUnique({ where: { address: userAddress } });
    if (!user) {
      user = await this.prisma.user.create({ data: { address: userAddress, walletName } });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { walletName },
      });
    }

    const newNonce = generateNonce('I agree to the term and conditions of the HSUPPLY: ');
    await this.prisma.walletNonce.update({
      where: { address: userAddress },
      data: { nonce: newNonce, userId: user.id },
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
        walletName: user.walletName,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
