import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePictureDto {
  @IsNotEmpty()
  @IsString()
  productId: string;
}
