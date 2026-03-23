import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: string[] = [];

  create(name: string) {
    this.users.push(name);
    return { message: 'Usuário criado' };
  }

  findAll() {
    return this.users;
  }
}
