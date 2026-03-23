import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(): string[] {
    return ['Neto', 'João', 'Maria'];
  }

  @Post()
  create(@Body() body: { name: string }) {
    return this.usersService.create(body.name);
  }
}
