import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException,
  Req,
  Get,
  UsePipes,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() { refreshToken }: { refreshToken: string }) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  verifyToken(@Request() req) {
    // If JwtAuthGuard passes, token is valid
    return { 
      valid: true, 
      user: {
        id: req.user.userId,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
        isVerified: req.user.isVerified,
      }
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-private-key')
  async verifyPrivateKey(
    @Req() req,
    @Body('privateKey') privateKey: string,
  ) {
    const isValid = await this.authService.verifyPrivateKey(req.user.sub, privateKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid private key');
    }
    return { success: true };
  }

  @Post('verify-wallet')
  async verifyWallet(@Body() body: { userId: string; signature: string; message: string }) {
    return this.authService.verifyWallet(body.userId, body.signature, body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Post('get-voter-token')
  async getVoterToken(
    @Req() req,
    @Body('privateKey') privateKey: string,
  ) {
    return {
      voterToken: await this.authService.getVoterToken(req.user.sub, privateKey),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.authService.getUserProfile(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
