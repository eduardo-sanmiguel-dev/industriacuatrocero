import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString({
    message: 'El token de renovación debe ser una cadena de texto válida.',
  })
  @IsNotEmpty({
    message: 'El token de renovación es requerido para dispositivos móviles.',
  })
  refreshToken!: string; // 📱 Exclusivo para Expo
}
