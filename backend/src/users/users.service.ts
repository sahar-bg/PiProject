import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Créer un nouvel utilisateur (inscription)
   */
  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new ConflictException('Cet email est déjà utilisé');
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        saltRounds,
      );

      // Créer l'utilisateur
      const newUser = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        password: hashedPassword,
      });

      const savedUser = await newUser.save();

      // Retourner sans le mot de passe
      return {
        message: 'Utilisateur créé avec succès',
        user: this.sanitizeUser(savedUser),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        "Erreur lors de la création de l'utilisateur: " + error.message,
      );
    }
  }

  /**
   * Connexion utilisateur
   */
  async login(loginUserDto: LoginUserDto): Promise<any> {
    try {
      // Trouver l'utilisateur par email
      const user = await this.userModel.findOne({
        email: loginUserDto.email.toLowerCase(),
      });

      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Vérifier si le compte est actif
      if (!user.isActive) {
        throw new UnauthorizedException(
          "Votre compte est désactivé. Contactez l'administrateur",
        );
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Mettre à jour la date de dernière connexion
      user.lastLogin = new Date();
      await user.save();

      // Retourner les informations utilisateur
      return {
        message: 'Connexion réussie',
        user: this.sanitizeUser(user),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        'Erreur lors de la connexion: ' + error.message,
      );
    }
  }

  /**
   * Trouver tous les utilisateurs
   */
  async findAll(): Promise<any[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.sanitizeUser(user));
  }

  /**
   * Trouver un utilisateur par ID
   */
  async findById(id: string): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Trouver un utilisateur par email (pour usage interne)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * Supprimer les informations sensibles de l'utilisateur
   */
  private sanitizeUser(user: UserDocument): any {
    const userObject = user.toObject();
    const { password, __v, ...sanitizedUser } = userObject;
    return sanitizedUser;
  }
}
