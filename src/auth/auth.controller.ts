import { Controller, Post, Req } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators/http/route-params.decorator';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() authDto: AuthDto) {
    return this.authService.signup(authDto);
  }

  @Post('signin')
  signin(@Body() authDto: AuthDto) {
    return this.authService.signin(authDto);
  }
}
