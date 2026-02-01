import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users/register
   * Créer un nouveau compte utilisateur
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * POST /users/login
   * Connexion utilisateur
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  /**
   * GET /users
   * Récupérer tous les utilisateurs
   */
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      message: 'Liste des utilisateurs récupérée avec succès',
      data: users,
      count: users.length,
    };
  }

  /**
   * GET /users/:id
   * Récupérer un utilisateur par ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      success: true,
      message: 'Utilisateur récupéré avec succès',
      data: user,
    };
  }
}
