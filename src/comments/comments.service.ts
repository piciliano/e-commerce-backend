import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}
  async create(
    createCommentDto: CreateCommentDto,
    productId: string,
    tokenPayLoad: TokenPayloadDto,
  ) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Produto não encontrado.');
      }

      return await this.prisma.comment.create({
        data: {
          comment: createCommentDto.comment,
          rating: createCommentDto.rating,
          productId,
          userId: tokenPayLoad.id,
          author: tokenPayLoad.name,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao criar o comentário.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return `This action returns all comments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
