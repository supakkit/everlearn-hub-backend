import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from './responses/user.response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResponse })
  async getProfile(@Request() req: AuthRequest) {
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return new UserResponse(user);
  }

  @Patch('me')
  @ApiOkResponse({ type: UserResponse })
  @UseInterceptors(FileInterceptor('avatarFile'))
  async update(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ) {
    const user = await this.usersService.update(
      req.user.sub,
      updateUserDto,
      req.user.role,
      avatarFile,
    );
    return new UserResponse(user);
  }

  @Delete('me')
  @ApiOkResponse({ type: UserResponse })
  async delete(@Request() req: AuthRequest) {
    await this.usersService.softDelete(req.user.sub);
  }
}
