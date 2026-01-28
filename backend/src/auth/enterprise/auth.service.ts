import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { generateNonce, checkSignature } from '@meshsdk/core';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string) {
    const userAddress = address.trim();
    const nonce = generateNonce(
      'I agree to the term and conditions of the HSUPPLY: ',
    );

    const user = await this.prisma.user.upsert({
      where: { address: userAddress },
      update: {},
      create: { address: userAddress },
    });

    await this.prisma.walletNonce.upsert({
      where: { address: userAddress },
      update: { nonce, userId: user.id },
      create: { address: userAddress, nonce, userId: user.id },
    });

    return { nonce };
  }

  private async assignEnterpriseRoleIfNone(userId: string) {
    const existing = await (this.prisma as any).userRole.findMany({
      where: { userId },
      select: { id: true },
    });
    if (existing.length > 0) return;

    const enterpriseRole = await (this.prisma as any).role.findUnique({
      where: { code: 'ENTERPRISE' },
      select: { id: true },
    });
    if (!enterpriseRole) {
      return;
    }

    await (this.prisma as any).userRole.create({
      data: {
        userId,
        roleId: enterpriseRole.id,
      },
    });
  }

  async verifyWallet(
    address: string,
    signature: string,
    key: string,
    walletName: string,
  ) {
    const userAddress = address.trim();
    const walletNonce = await this.prisma.walletNonce.findUnique({
      where: { address: userAddress },
    });

    if (!walletNonce) {
      throw new UnauthorizedException('Nonce not found. Get nonce first.');
    }

    const isValid = checkSignature(
      walletNonce.nonce,
      { signature, key },
      userAddress,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const user = await this.prisma.user.upsert({
      where: { address: userAddress },
      update: { walletName },
      create: { address: userAddress, walletName },
    });

    await this.assignEnterpriseRoleIfNone(user.id);

    const newNonce = generateNonce(
      'I agree to the term and conditions of the HSUPPLY: ',
    );
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

}

