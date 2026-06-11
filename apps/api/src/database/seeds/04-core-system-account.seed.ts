import * as argon2 from 'argon2'; // 🚀 Importamos el estándar de seguridad Argon2id
import { AppDataSource } from '../data-source';
import { SystemAccount } from '../../modules/core/entities/system-account.entity';
import { User } from '../../modules/core/entities/user.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedSystemAccounts() {
  console.log(
    '⏳ Iniciando siembra de datos (Seeding) para core_system_accounts usando Argon2id...',
  );

  const systemAccountRepository = AppDataSource.getRepository(SystemAccount);
  const userRepository = AppDataSource.getRepository(User);

  // 1. Definimos los datos crudos para las cuentas, asociándolos a la identidad del usuario madre
  const initialAccounts = [
    {
      email: SEED_CONFIG.tenants.trujillo.adminEmail, // Correo único de acceso para Eduardo
      rawPassword: '123', // Contraseña en texto plano (Se convertirá a hash Argon2id)
      userFirstName: 'Eduardo',
      userLastName: 'Dominguez',
    },
    {
      email: SEED_CONFIG.tenants.hada.adminEmail, // Correo único de acceso para Victoria
      rawPassword: '12345',
      userFirstName: 'Victoria',
      userLastName: 'Barros',
    },
  ];

  // 2. Iteramos de forma segura para procesar cada cuenta de acceso
  for (const accountData of initialAccounts) {
    // Validamos la idempotencia buscando si el correo ya está registrado en el sistema
    const exists = await systemAccountRepository.findOne({
      where: { email: accountData.email },
    });

    if (!exists) {
      // Buscamos al usuario correspondiente en la tabla madre core_users
      const associatedUser = await userRepository.findOne({
        where: {
          firstName: accountData.userFirstName,
          lastName: accountData.userLastName,
        },
        relations: {
          tenant: true, // Incluimos la relación del tenant para heredar el tenantId en la cuenta
        },
      });

      if (!associatedUser) {
        console.error(
          `❌ Error: No se encontró al usuario '${accountData.userFirstName} ${accountData.userLastName}'.`,
        );
        continue;
      }

      // 🔒 MÁXIMA SEGURIDAD: Transformamos la contraseña en un hash Argon2id híbrido (Tiempo + Memoria)
      // Por defecto, la librería aplica el perfil 'Argon2id' que balancea resistencia física y rendimiento
      // 🔒 CONFIGURACIÓN DE MÁXIMO BLINDAJE CRIPTOGRÁFICO (Estándar OWASP Avanzado)
      const passwordHash = await argon2.hash(accountData.rawPassword, {
        type: argon2.argon2id, // 🚀 Forzamos el tipo Argon2id (El más seguro del mundo)
        memoryCost: 65536, // 🧠 Usa exactamente 64 MB de memoria RAM por intento
        timeCost: 3, // ⏱️ Realiza 3 iteraciones completas de cálculo
        parallelism: 4, // 🧵 Utiliza hasta 4 hilos de ejecución en paralelo
      });

      // Creamos la instancia inyectando el tenantId heredado del usuario y la relación 1:1
      const newAccount = systemAccountRepository.create({
        email: accountData.email,
        passwordHash: passwordHash, // Guardamos el hash cifrado de última generación
        tenantId: associatedUser.tenant.id, // Heredamos automáticamente el mismo inquilino del usuario
        user: associatedUser, // Enlazamos físicamente la cuenta con su identidad madre
      });

      // Guardamos físicamente en PostgreSQL en formato UTC
      await systemAccountRepository.save(newAccount);
      console.log(
        `✅ Cuenta cifrada con Argon2id creada para: ${accountData.email}`,
      );
    } else {
      console.log(
        `ℹ️ La cuenta con el correo '${accountData.email}' ya se encuentra registrada. Saltando...`,
      );
    }
  }

  console.log(
    '🏁 Proceso de seeding para core_system_accounts finalizado con éxito.',
  );
}
