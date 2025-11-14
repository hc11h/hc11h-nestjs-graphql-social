import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: RegisterUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');
  
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
      }
    });

    console.log(user)
  
    
    return {
      id: user.id,         
      name: user.name,
      email: user.email,
    };
  }
  

  async findAll(email:string) {
    return await this.prisma.user.findUnique({where:{email}});
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEMail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  
}
