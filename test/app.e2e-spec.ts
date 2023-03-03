import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const authDto: AuthDto = {
      email: 'abc@abc.com',
      password: '123',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(authDto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ password: authDto.password })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: authDto.email })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(authDto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200);
      });
    });
    describe('Edit me', () => {
      it('should edit current user', () => {
        const editUserDto: EditUserDto = {
          firstName: 'testabc',
          email: 'testabc@testabc.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(editUserDto)
          .expectStatus(200)
          .expectBodyContains(editUserDto.firstName)
          .expectBodyContains(editUserDto.email);
      });
    });
  });

  describe('Bookmarks', () => {

    describe('Get empty bookmarks', () => {
      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmarks', () => {
      it('should create bookmarks', () => {
        const createBookmarkDto: CreateBookmarkDto = {
          title: 'First Bookmark',
          link: 'https://www.youtube.com',
        };
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .withBody(createBookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id')
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectJsonLength(1)
      });
    });

    describe('Get bookmarks by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      });
    });

    describe('Edit bookmark by id', () => {
      const editBookmarkDto: EditBookmarkDto = {
        title: 'Kubernetes Crash Cours',
        link: 'www.example.com',
        description: 'Learn Kubernetes'
      } 

      it('should edit bookmark', () => {
        return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .withBody(editBookmarkDto)
        .expectStatus(200)
      })
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(204)
      })
    });

      it('should get empty bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer $S{token}`,
          })
          .expectStatus(200)
          .expectBody([]);
      });

  });
});
