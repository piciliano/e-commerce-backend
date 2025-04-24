import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreatePictureDto } from './dto/create-picture.dto';

@Controller('pictures')
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @UseInterceptors(FilesInterceptor('files', 5))
  @Post()
  async uploadPictures(
    @Body() createPictureDto: CreatePictureDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    if (files.length > 5) {
      throw new BadRequestException('Você pode enviar no máximo 5 imagens.');
    }
    return this.picturesService.create(files, createPictureDto);
  }

  @Get()
  findAll() {
    return this.picturesService.findAll();
  }
}
