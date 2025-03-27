export class TokenPayloadDto {
  id: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  name: string;
}
