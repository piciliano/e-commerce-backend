import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PicturesService } from './pictures.service';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePictureDto } from './dto/create-picture.dto';

@Controller('pictures')
export class PicturesController {
  constructor(private readonly picturesService: PicturesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadPicture(
    @Body() createPictureDto: CreatePictureDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * (1024 * 1024) }),
          new FileTypeValidator({ fileType: /jpeg|jpg|png/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @TokenPayloadParam()
    tokenPayload: TokenPayloadDto,
  ) {
    return this.picturesService.create(file, createPictureDto);
  }

  @Get()
  findAll() {
    return this.picturesService.findAll();
  }
}
