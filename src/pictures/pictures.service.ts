import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { CreatePictureDto } from './dto/create-picture.dto';

@Injectable()
export class PicturesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(file: Express.Multer.File, createPictureDto: CreatePictureDto) {
    try {
      const supaBaseUrl = process.env.SUPABASE_URL as string;
      const supaBaseKey = process.env.SUPABASE_KEY as string;
      const supabase = createClient(supaBaseUrl, supaBaseKey, {
        auth: {
          persistSession: false,
        },
      });

      const result = await supabase.storage
        .from('garage')
        .upload(file.originalname, file.buffer, {
          upsert: true,
        });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const publicUrl = supabase.storage
        .from('garage')
        .getPublicUrl(file.originalname).data.publicUrl;

      if (!publicUrl) {
        throw new Error('Erro ao obter a URL da imagem');
      }

      const productExists = await this.prisma.product.findUnique({
        where: { id: createPictureDto.productId },
      });

      if (!productExists) {
        throw new NotFoundException('Produto não existe');
      }

      const savedData = await this.prisma.picture.create({
        data: {
          link: publicUrl,
          productId: createPictureDto.productId,
        },
      });

      return savedData;
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

  async findAll() {
    return this.prisma.picture.findMany();
  }
}
