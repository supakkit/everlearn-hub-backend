import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async update(id: string, updateUserDto: UpdateUserDto, requesterRole: Role) {
    if (requesterRole !== Role.ADMIN) {
      delete updateUserDto.role;
    }

    const data: UpdateUserDto = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(
        updateUserDto.password,
        roundsOfHashing,
      );
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
