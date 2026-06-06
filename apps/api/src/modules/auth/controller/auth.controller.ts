import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';

@Controller('auth') // Endpoint macro: http://localhost:3000/api/v1/auth
export class AuthController {
  // Inyección de dependencia estricta del servicio de autenticación
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK) // Cambia el comportamiento por defecto de POST (201 Created) al estándar de consultas (200 OK)
  async login(
    @Body() loginDto: LoginDto, // Valida estrictamente el correo y la contraseña (de 8 a 128 caracteres) con class-validator
  ): Promise<{ accessToken: string }> {
    return this.authService.login(loginDto);
  }
}
