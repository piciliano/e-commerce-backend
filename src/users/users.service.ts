import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User } from '@prisma/client';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const password = await this.hashingService.hash(createUserDto.password);

      const { email, name } = createUserDto;

      return this.prisma.user.create({
        data: {
          password,
          email,
          name,
        },
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

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();

      if (!users) {
        throw new NotFoundException('No users found');
      }

      return users;
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

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        throw new NotFoundException('No user found');
      }

      return user;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, tokenPayload: TokenPayloadDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        include: { products: true },
      });

      if (!user) {
        throw new NotFoundException('No user found');
      }

      if (tokenPayload.id !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to access this user',
        );
      }

      return user;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'You have not permission',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findProductsByUser(tokenPayload: TokenPayloadDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: tokenPayload.id,
        },
        include: {
          products: {
            include: {
              pictures: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('No user found');
      }

      if (tokenPayload.id !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to access this user',
        );
      }

      if (Array.isArray(user.cart) && user.cart.length > 0) {
        const existingProducts = await this.prisma.product.findMany({
          where: {
            id: {
              in: user.cart,
            },
          },
          select: { id: true },
        });

        const validIds = new Set(existingProducts.map((p) => p.id));
        const updatedCart = user.cart.filter((productId) =>
          validIds.has(productId),
        );

        if (updatedCart.length !== user.cart.length) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              cart: updatedCart,
            },
          });

          user.cart = updatedCart;
        }
      }

      return user;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error fetching user products',
          error: error.message || 'unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (user) {
        return this.prisma.user.delete({
          where: {
            id,
          },
        });
      }
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
}
