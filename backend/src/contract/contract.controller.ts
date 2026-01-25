import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Public, CurrentUser } from '../auth/decorators';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Public()
  @Get('info')
  async getInfo(@Query('walletAddress') walletAddress: string) {
    return this.contractService.getPolicyId(walletAddress);
  }

  @Get('prepare-metadata/:productId')
  async prepareMetadata(
    @CurrentUser() user: { id: string } | undefined,
    @Param('productId') productId: string,
  ) {
    if (!user) {
      throw new Error('Authentication required');
    }
    return this.contractService.prepareProductMetadata(productId, user.id);
  }

  @Post('mint')
  async createMint(
    @CurrentUser() user: { id: string } | undefined,
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: MintDto[],
  ) {
    return this.contractService.createMint(walletAddress, assets, user?.id);
  }

  @Public()
  @Post('burn')
  async createBurn(
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: BurnDto[],
  ) {
    return this.contractService.createBurn(walletAddress, assets);
  }

  @Post('update')
  async createUpdate(
    @CurrentUser() user: { id: string } | undefined,
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: UpdateMetadataDto[],
    @Body('productId') productId?: string,
  ) {
    if (!user) {
      throw new Error('Authentication required');
    }
    return this.contractService.createUpdate(walletAddress, assets, user.id, productId);
  }

  @Public()
  @Post('payment')
  async createPayment(
    @Body('walletAddress') walletAddress: string,
    @Body('amount') amount: string,
  ) {
    return this.contractService.createPayment(walletAddress, amount);
  }
}
