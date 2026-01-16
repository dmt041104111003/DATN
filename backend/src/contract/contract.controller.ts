import { Controller, Get, Post, Body } from '@nestjs/common';
import { ContractService } from './contract.service';
import { MintDto } from './dto/mint.dto';
import { BurnDto } from './dto/burn.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('contract')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Public()
  @Get('info')
  getInfo() {
    return this.contractService.getInfo();
  }

  @Post('mint')
  mint(
    @CurrentUser() user: { id: string; address: string },
    @Body() dto: MintDto[],
  ) {
    return this.contractService.mint(dto);
  }

  @Post('burn')
  burn(
    @CurrentUser() user: { id: string; address: string },
    @Body() dto: BurnDto[],
  ) {
    return this.contractService.burn(dto);
  }

  @Post('update')
  update(
    @CurrentUser() user: { id: string; address: string },
    @Body() dto: UpdateMetadataDto[],
  ) {
    return this.contractService.update(dto);
  }
}
