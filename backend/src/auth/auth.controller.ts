import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Request
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
}
