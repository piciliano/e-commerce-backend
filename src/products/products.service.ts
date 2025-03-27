import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'prisma/prisma.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    try {
      return this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error creating user',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToCart(productId: string, tokenPayLoad: TokenPayloadDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new HttpException(
          'Produto não encontrado.',
          HttpStatus.NOT_FOUND,
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: tokenPayLoad.id },
      });

      if (!user) {
        throw new HttpException(
          'Usuário não encontrado.',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: tokenPayLoad.id },
        data: {
          cart: {
            push: product.id,
          },
        },
      });

      return updatedUser;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error creating user',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findProductsInCart(tokenPayLoad: TokenPayloadDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: tokenPayLoad.id },
      });

      if (!user) {
        throw new Error('Usuário não encontrado.');
      }

      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: user.cart,
          },
        },
      });

      const totalPrice = products
        .reduce((sum, product) => sum + Number(product.price), 0)
        .toFixed(2);

      return { products, totalPrice };
    } catch (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }
  }

  async findAll(query?: string, page: number = 1, limit: number = 8) {
    const skip = (page - 1) * limit;
    const pageInt = Number(page) || 1;
    const limitInt = Number(limit) || 8;

    try {
      const normalizedQuery = query ? removeAccents(query) : '';

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: normalizedQuery
            ? {
                title: {
                  contains: normalizedQuery,
                  mode: 'insensitive',
                },
              }
            : {},
          include: { pictures: true },
          take: limitInt,
          skip: skip,
        }),
        this.prisma.product.count({
          where: normalizedQuery
            ? {
                title: {
                  contains: normalizedQuery,
                  mode: 'insensitive',
                },
              }
            : {},
        }),
      ]);

      return {
        data: products,
        total,
        page: pageInt,
        totalPages: Math.ceil(total / limitInt),
      };
    } catch (error) {
      console.error('Error in findAll: ', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao buscar produtos',
          error: error.message || 'Erro desconhecido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          id: id,
        },
        include: {
          pictures: true,
          comments: true,
        },
      });

      if (!product) {
        throw new NotFoundException('No product Found.');
      }

      return product;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error creating user',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }

  async removeProductInCart(id: string, tokenPayLoad: TokenPayloadDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: tokenPayLoad.id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedCart = user.cart.filter((productId) => productId !== id);

      return await this.prisma.user.update({
        where: { id: tokenPayLoad.id },
        data: { cart: updatedCart },
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error removing product from cart',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
