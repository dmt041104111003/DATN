import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Public()
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('my')
  findMy(@CurrentUser() user: { id: string }) {
    return this.productService.findAllByUser(user.id);
  }

  @Get('quota')
  getQuota(@CurrentUser() user: { id: string }) {
    return this.productService.getQuota(user.id);
  }

  @Public()
  @Get('trace/:policyId/:assetName')
  trace(
    @Param('policyId') policyId: string,
    @Param('assetName') assetName: string,
  ) {
    return this.productService.traceByNft(policyId, assetName);
  }

  @Public()
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.productService.getHistory(id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
  // @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateProductDto) {
    return this.productService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.productService.remove(id, user.id);
  }
}