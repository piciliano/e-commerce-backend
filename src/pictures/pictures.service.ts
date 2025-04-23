import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { CreatePictureDto } from './dto/create-picture.dto';
import { Picture } from '@prisma/client';

@Injectable()
export class PicturesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(files: Express.Multer.File[], dto: CreatePictureDto) {
    try {
      const supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_KEY as string,
        { auth: { persistSession: false } },
      );

      // Verifica se o produto existe
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Produto não encontrado');
      }

      // Verifica quantas imagens já existem para o produto
      const existingPictures = await this.prisma.picture.count({
        where: { productId: dto.productId },
      });

      // Se o número de imagens já existentes somado com as novas for maior que 5, retorna erro
      if (existingPictures + files.length > 5) {
        throw new HttpException(
          'O número máximo de imagens para este produto é 5.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const savedPictures: Picture[] = [];

      // Faz o upload das imagens
      for (const file of files) {
        const upload = await supabase.storage
          .from('garage')
          .upload(file.originalname, file.buffer, { upsert: true });

        if (upload.error) {
          throw new Error(upload.error.message);
        }

        const publicUrl = supabase.storage
          .from('garage')
          .getPublicUrl(file.originalname).data.publicUrl;

        const saved = await this.prisma.picture.create({
          data: {
            link: publicUrl,
            productId: dto.productId,
          },
        });

        savedPictures.push(saved);
      }

      return savedPictures;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro ao fazer upload de imagens',
          error: error.message || 'Erro desconhecido',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return this.prisma.picture.findMany();
  }
}
