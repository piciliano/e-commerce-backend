import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthTokenGuard)
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @TokenPayloadParam() TokenPayloadDto: TokenPayloadDto,
  ) {
    return this.productsService.create(createProductDto, TokenPayloadDto);
  }

  @UseGuards(AuthTokenGuard)
  @Post('cart/:productId')
  async addToCart(
    @Param('productId') productId: string,
    @TokenPayloadParam() tokenPayLoad: TokenPayloadDto,
  ) {
    return this.productsService.addToCart(productId, tokenPayLoad);
  }

  @UseGuards(AuthTokenGuard)
  @Get('getProductsInCart')
  findProductsInCart(@TokenPayloadParam() tokenPayLoad: TokenPayloadDto) {
    return this.productsService.findProductsInCart(tokenPayLoad);
  }

  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 8,
  ) {
    return this.productsService.findAll(query, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(AuthTokenGuard)
  @Patch('deleteItemCart/:id')
  removeProductInCart(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayLoad: TokenPayloadDto,
  ) {
    return this.productsService.removeProductInCart(id, tokenPayLoad);
  }
}
