import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail(
    {},
    {
      message:
        'El correo electrónico proporcionado no tiene un formato válido.',
    },
  )
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto válida.' })
  // 🚀 ESTÁNDAR DE ALTA SEGURIDAD: Mínimo 8 caracteres para bloquear accesos débiles,
  // y máximo 128 para mitigar ataques de sobrecarga de buffers al algoritmo Argon2id.
  @Length(8, 128, {
    message: 'La contraseña debe tener entre 8 y 128 caracteres.',
  })
  password!: string;
}
