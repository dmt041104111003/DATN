import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateDto } from './dto/update.dto';
import { RetireDto } from './dto/retire.dto';
import { SubmitTxDto } from './dto/submit-tx.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('contract')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Get('info')
  async getInfo(@Query('owners') ownersParam: string) {
    const owners = ownersParam ? ownersParam.split(',') : [];
    return this.contractService.getInfo(owners);
  }

  @Post('mint')
  async createMint(@Body() dto: MintDto) {
    return this.contractService.createMint(
      dto.walletAddress,
      dto.owners,
      dto.assets.map((a) => ({
        assetName: a.assetName,
        quantity: a.quantity || '1',
        metadata: a.metadata,
        receiver: a.receiver,
      })),
    );
  }

  @Post('update')
  async createUpdate(@Body() dto: UpdateDto) {
    return this.contractService.createUpdate(
      dto.walletAddress,
      dto.owners,
      dto.assets.map((a) => ({
        assetName: a.assetName,
        metadata: a.metadata,
      })),
    );
  }

  @Post('burn')
  async createBurn(@Body() dto: BurnDto) {
    return this.contractService.createBurn(
      dto.walletAddress,
      dto.owners,
      dto.assets.map((a) => ({
        assetName: a.assetName,
      })),
    );
  }

  @Post('retire')
  async createRetire(@Body() dto: RetireDto) {
    return this.contractService.createRetire222(
      dto.walletAddress,
      dto.owners,
      dto.assets.map((a) => ({ assetName: a.assetName })),
    );
  }

  @Post('submit')
  async submitTx(@Body() dto: SubmitTxDto) {
    return this.contractService.submitTx(dto.signedTx);
  }

  @Post('transfer')
  async createTransfer(@Body() dto: TransferDto) {
    return this.contractService.createTransfer(
      dto.walletAddress,
      dto.receiver,
      dto.policyId,
      dto.assetName,
      dto.quantity || '1',
    );
  }
}
