import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthPayload } from './models/auth-payload.model';
import { UserService } from 'src/modules/user/user.service';
import { UserType } from 'src/modules/user/dto/user.type';
import { Public } from './decorators/public.decorator';
import { AuthUserType } from 'src/modules/user/dto/auth-user.type';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Public()
  @Mutation(() => AuthUserType, { name: 'register' })
  async register(@Args('input') input: RegisterUserDto): Promise<AuthUserType> {
    return this.userService.createUser(input);
  }

  @Public()
  @Mutation(() => AuthPayload, { name: 'login' })
  async login(@Args('car') input: LoginUserDto): Promise<AuthPayload> {
     const { user, access_token } = await this.authService.login(input);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
