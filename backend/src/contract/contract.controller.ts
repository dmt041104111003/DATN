import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Public } from '../auth/public.decorator';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Public()
  @Get('info')
  async getInfo(@Query('walletAddress') walletAddress: string) {
    return this.contractService.getPolicyId(walletAddress);
  }

  @Public()
  @Post('mint')
  async createMint(
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: MintDto[],
  ) {
    return this.contractService.createMint(walletAddress, assets);
  }

  @Public()
  @Post('burn')
  async createBurn(
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: BurnDto[],
  ) {
    return this.contractService.createBurn(walletAddress, assets);
  }

  @Public()
  @Post('update')
  async createUpdate(
    @Body('walletAddress') walletAddress: string,
    @Body('assets') assets: UpdateMetadataDto[],
  ) {
    return this.contractService.createUpdate(walletAddress, assets);
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
