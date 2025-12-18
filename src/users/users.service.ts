import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { RedisService } from 'src/redis/redis.service';
import { RedisKey } from 'src/common/utils/redis.keys';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private redisService: RedisService,
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

  async findAll(query: GetUsersDto) {
    const { page: rawPage, limit: rawLimit } = query;
    const page = Number(rawPage?.trim()) || 1;
    const limit = Number(rawLimit?.trim()) || 10;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
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

    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) throw new ConflictException('Email is already in use');
    }

    if (avatar || deleteAvatar) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id, isDeleted: false },
      });

      if (currentUser?.avatarPublicId) {
        await this.cloudinaryService.deleteSingleFile(
          FileType.IMAGE,
          currentUser.avatarPublicId,
        );
        data.avatarPublicId = null;
      }

      if (avatar) {
        const uploaded = await this.cloudinaryService.uploadSingleFile(
          avatar,
          FileType.IMAGE,
          CloudinaryFolder.AVATARS,
        );
        data.avatarPublicId = String(uploaded.public_id);
      }
    }

    return this.prisma.user.update({ where: { id, isDeleted: false }, data });
  }

  async adminUpdateUser(id: string, adminUpdateUserDto: AdminUpdateUserDto) {
    return this.prisma.user.update({
      where: { id, isDeleted: false },
      data: { role: adminUpdateUserDto.role },
    });
  }

  async softDelete(id: string) {
    await this.prisma.user.update({
      where: { id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    const keys = await this.redisService.keys(RedisKey.patternOfUserFields(id));
    for (const key of keys) await this.redisService.del(key);
  }
}
