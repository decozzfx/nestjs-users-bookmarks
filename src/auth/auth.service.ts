import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signin(authDto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findFirst({
      where: {
        email: authDto.email,
      },
    });

    // if user doesnt exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // compare password
    const pwdMatches = await argon.verify(user.hash, authDto.password);

    // if password incorrect throw exception
    if (!pwdMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }
    delete user.hash;
    // send back the user
    return user;
  }

  async signup(authDto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(authDto.password);

      // save the new user password in the db
      const user = await this.prisma.user.create({
        data: {
          email: authDto.email,
          hash,
        },
      });

      delete user.hash;
      return {
        user,
      };
    } catch (error) {
      console.log(error);
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials has taken');
      }

      throw error;
    }
  }
}
