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

  private readonly userSelect = {
    id: true,
    address: true,
    roleCode: true,
    displayName: true,
    phoneNumber: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  } as any;

  private async loadWarehouseForAddress(address: string) {
    const addr = this.getAddress(address);
    if (!addr) return null;
    return (this.prisma as any).warehouse.findFirst({
      where: { registeringCustodianAddress: addr },
      select: { id: true, name: true, capacity: true, location: true },
    });
  }

  private async mapProfileRow(account: any) {
    if (!account) return null;
    const warehouse = await this.loadWarehouseForAddress(account.address);
    return {
      id: account.id,
      walletAddress: account.address,
      roleCode: account.roleCode,
      displayName: account.displayName,
      phoneNumber: account.phoneNumber,
      isActive: account.isActive,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      warehouseId: warehouse?.id ?? null,
      name: warehouse?.name ?? '',
      capacity: warehouse?.capacity ?? '',
      location: warehouse?.location ?? '',
    };
  }

  private getAddress(value: string) {
    return (value || '').trim();
  }

  private getSecret() {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new UnauthorizedException('Chưa cấu hình JWT_SECRET trên server.');
    return secret;
  }

  private validatePaymentAddress(custodianAddress: string) {
    const addr = this.getAddress(custodianAddress);
    const isPayment =
      /^addr1[0-9a-z]+$/.test(addr) || /^addr_test1[0-9a-z]+$/.test(addr);

    if (!isPayment) {
      throw new BadRequestException(
        `Địa chỉ ví không hợp lệ. Dùng addr... / addr_test.... Nhận được: ${custodianAddress}`,
      );
    }

    return addr;
  }

  async createProfile(custodianAddress: string, data: {
    roleCode: string;
    displayName: string;
    phoneNumber?: string;
    warehouse?: {
      name?: string;
      capacity?: string;
      location?: string;
    };
  }) {
    const addr = this.validatePaymentAddress(custodianAddress);

    const roleCode = (data.roleCode || '').trim().toUpperCase();
    if (!roleCode) throw new BadRequestException('Vai trò là bắt buộc.');
    const role = await (this.prisma as any).role.findUnique({ where: { code: roleCode } });
    if (!role) throw new BadRequestException('Vai trò không hợp lệ.');
    const displayName = (data.displayName || '').trim();
    if (!displayName) throw new BadRequestException('Tên hiển thị là bắt buộc.');
    const phoneNumber = (data.phoneNumber || '').trim() || null;
    const existing = await (this.prisma as any).user.findUnique({
      where: { address: addr },
      select: { roleCode: true },
    });
    if (existing?.roleCode && existing.roleCode !== roleCode) {
      throw new BadRequestException('Không thể đổi vai trò sau khi tạo hồ sơ.');
    }

    const account = await (this.prisma as any).user.update({
      where: { address: addr },
      data: {
        roleCode: existing?.roleCode || roleCode,
        displayName,
        phoneNumber,
        isActive: true,
      } as any,
      select: this.userSelect,
    });

    const warehouseName = (data.warehouse?.name || '').trim();
    const warehouseCapacity = (data.warehouse?.capacity || '').trim();
    const warehouseLocation = (data.warehouse?.location || '').trim();
    if (!warehouseName || !warehouseCapacity || !warehouseLocation) {
      throw new BadRequestException('Thông tin kho (tên, sức chứa, vị trí) là bắt buộc khi đăng ký.');
    }

    const existingWarehouse = await (this.prisma as any).warehouse.findFirst({
      where: { registeringCustodianAddress: addr },
      select: { id: true },
    });
    if (!existingWarehouse) {
      await (this.prisma as any).warehouse.create({
        data: {
          name: warehouseName,
          capacity: warehouseCapacity,
          location: warehouseLocation,
          registeringCustodianAddress: addr,
        } as any,
      });
    }

    return {
      token: jwt.sign({
        sub: addr,
        stakeAddress: addr,
        paymentAddress: addr,
        walletAddress: addr,
        profileId: account.id,
        role: account.roleCode,
        displayName: account.displayName,
        phoneNumber: account.phoneNumber,
      }, this.getSecret(), { expiresIn: '7d' }),
      profile: await this.mapProfileRow(account),
    };
  }

  async updateProfile(accountId: string, data: {
    displayName?: string;
    phoneNumber?: string;
    warehouse?: {
      name?: string;
      capacity?: string;
      location?: string;
    };
  }) {
    const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
    const phoneNumber = typeof data.phoneNumber === 'string' ? data.phoneNumber.trim() || null : undefined;

    if (!displayName) {
      throw new BadRequestException('Tên hiển thị là bắt buộc.');
    }

    const account = await (this.prisma as any).user.update({
      where: { id: accountId },
      data: {
        displayName,
        ...(phoneNumber !== undefined ? { phoneNumber } : {}),
      } as any,
      select: this.userSelect,
    });

    const warehousePayload = data.warehouse;
    if (warehousePayload) {
      const warehouseName = (warehousePayload.name || '').trim();
      const warehouseCapacity = (warehousePayload.capacity || '').trim();
      const warehouseLocation = (warehousePayload.location || '').trim();
      if (!warehouseName || !warehouseCapacity || !warehouseLocation) {
        throw new BadRequestException('Thông tin kho (tên, sức chứa, vị trí) là bắt buộc.');
      }
      const existingWarehouse = await this.loadWarehouseForAddress(account.address);
      if (existingWarehouse?.id) {
        await (this.prisma as any).warehouse.update({
          where: { id: existingWarehouse.id },
          data: {
            name: warehouseName,
            capacity: warehouseCapacity,
            location: warehouseLocation,
          } as any,
        });
      }
    }

    return this.mapProfileRow(account);
  }

  async listProfiles(custodianAddress: string) {
    const addr = this.getAddress(custodianAddress);
    if (!addr) {
      throw new BadRequestException('Thiếu tham chiếu tài khoản.');
    }

    const account = await (this.prisma as any).user.findUnique({
      where: { address: addr },
      select: this.userSelect,
    });
    if (!account || !account.roleCode) return [];
    return [await this.mapProfileRow(account)];
  }

  async getProfileById(accountId: string) {
    const account = await (this.prisma as any).user.findUnique({
      where: { id: accountId },
      select: this.userSelect,
    });
    if (!account || !account.roleCode) {
      throw new BadRequestException('Không tìm thấy hồ sơ.');
    }
    return this.mapProfileRow(account);
  }
}
