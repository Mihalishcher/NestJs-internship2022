import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { User } from 'src/users/users.model';
import { disconnect } from 'mongoose';
import { UserUpdateDto } from '../src/users/dto/userUpdate.dto';

const testDto: User = {
  firstName: 'Mihail',
  lastName: 'Shcherbakov',
  email: 'mishka@gmail.com',
  password: '12345678',
};

const updateDto: UserUpdateDto = {
  firstName: 'Vitaliy',
  lastName: 'Danchul',
};

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let createdID: string;
  const wrongID = '63bc938daf87cf6571b94d01';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/ (POST) - SUCCESS', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(testDto)
      .expect(201)
      .then(({ body }: request.Response) => {
        createdID = body._id;
        expect(createdID).toBeDefined();
      });
  });

  it('/users/ (POST) - FAIL', () => {
    return request(app.getHttpServer()).post('/users').send().expect(500);
  });

  it('/users/ (GET) - SUCCESS', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.length).toBe(1);
        expect(body[0]._id).toBeDefined();
        expect(body[0].firstName).toBe('Mihail');
        expect(body[0].lastName).toBe('Shcherbakov');
        expect(body[0].email).toBe('mishka@gmail.com');
      });
  });

  it('/users/ (GET) - FAIL', () => {
    return request(app.getHttpServer()).get('/user').expect(404);
  });

  it('/users/:id (GET) - SUCCESS', async () => {
    return request(app.getHttpServer())
      .get('/users/' + createdID)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.firstName).toBe('Mihail');
        expect(body.lastName).toBe('Shcherbakov');
        expect(body.email).toBe('mishka@gmail.com');
      });
  });

  it('/users/:id (GET) - FAIL', async () => {
    return request(app.getHttpServer())
      .get('/users/' + wrongID)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({});
      });
  });

  it('/users/:id (PATCH) - SUCCESS', async () => {
    return request(app.getHttpServer())
      .patch('/users/' + createdID)
      .send(updateDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body.firstName).toBe('Vitaliy');
        expect(body.lastName).toBe('Danchul');
        expect(body.email).toBe('mishka@gmail.com');
      });
  });

  it('/users/:id (PATCH) - FAIL', async () => {
    return request(app.getHttpServer())
      .patch('/users/' + wrongID)
      .send(updateDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({});
      });
  });

  it('/users/:id (DELETE) - SUCCESS', () => {
    return request(app.getHttpServer())
      .delete('/users/' + createdID)
      .expect(200);
  });

  it('/users/:id (DELETE) - FAIL', async () => {
    return request(app.getHttpServer())
      .delete('/users/' + wrongID)
      .expect(200)
      .then(({ body }: request.Response) => {
        expect(body).toStrictEqual({});
      });
  });

  afterAll(() => {
    disconnect();
  });
});
