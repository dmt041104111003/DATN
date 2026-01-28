import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { generateNonce, checkSignature } from '@meshsdk/core';

@Injectable()
export class AgentAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getNonce(address: string) {
    const userAddress = address.trim();
    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });
    if (!user) {
      throw new UnauthorizedException('Agent not registered');
    }

    const nonce = generateNonce(
      'I agree to the term and conditions of the HSUPPLY: ',
    );

    await this.prisma.walletNonce.upsert({
      where: { address: userAddress },
      update: { nonce, userId: user.id },
      create: { address: userAddress, nonce, userId: user.id },
    });

    return { nonce };
  }

  private async getRoleCode(userId: string): Promise<'ENTERPRISE' | 'AGENT' | null> {
    const roles = await (this.prisma as any).userRole.findMany({
      where: { userId },
      select: { role: { select: { code: true } } },
    });
    if (!roles || roles.length === 0) return null;
    return roles[0].role.code;
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

    const user = await this.prisma.user.findUnique({
      where: { address: userAddress },
    });

    if (!user) {
      throw new UnauthorizedException('Agent not registered');
    }

    const roleCode = await this.getRoleCode(user.id);
    if (roleCode !== 'AGENT') {
      throw new UnauthorizedException('Agent role required');
    }

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

