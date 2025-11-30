import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    if (existingUser) {
      if (existingUser.isDeleted) {
        return this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            ...createUserDto,
            password: hashedPassword,
            isDeleted: false,
            deletedAt: null,
          },
        });
      } else {
        throw new ConflictException('Email is already registered');
      }
    }

    return this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
    });
  }

  findAll() {
    return this.prisma.user.findMany({ where: { isDeleted: false } });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id, isDeleted: false } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email, isDeleted: false } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requesterRole: Role,
    avatar?: Express.Multer.File,
  ) {
    if (requesterRole !== Role.ADMIN) {
      delete updateUserDto.role;
    }
    const { deleteAvatar, ...dtoData } = updateUserDto;
    const data: Prisma.UserUpdateInput = { ...dtoData };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
    }

    if (avatar || deleteAvatar) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id, isDeleted: false },
      });

      if (currentUser?.avatarPublicId) {
        await this.cloudinaryService.deleteImage(currentUser.avatarPublicId);
        data.avatarPublicId = null;
      }

      if (avatar) {
        const uploaded = await this.cloudinaryService.uploadSingleImage(
          avatar,
          CloudinaryFolder.AVATARS,
        );
        data.avatarPublicId = uploaded.public_id as string;
      }
    }

    return this.prisma.user.update({ where: { id, isDeleted: false }, data });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
