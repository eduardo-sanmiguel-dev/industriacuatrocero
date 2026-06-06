import { AppDataSource } from '../data-source';
import { User } from '../../modules/core/entities/user.entity';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedUsers() {
  console.log('⏳ Iniciando siembra de datos (Seeding) para core_users...');

  // 1. Obtenemos los repositorios necesarios de TypeORM
  const userRepository = AppDataSource.getRepository(User);
  const tenantRepository = AppDataSource.getRepository(Tenant);

  // 2. Definimos la información explícita de los usuarios vinculados a sus subdominios
  const initialUsers = [
    {
      firstName: 'Eduardo', // Nombres de la persona física
      lastName: 'Dominguez', // Apellidos completos de la persona física
      targetSubdomain: SEED_CONFIG.tenants.trujillo.subdomain, // Propiedad utilitaria para buscar el UUID de Cosméticos Trujillo
    },
    {
      firstName: 'Victoria', // Nombres de la persona física
      lastName: 'Barros', // Apellidos completos de la persona física
      targetSubdomain: SEED_CONFIG.tenants.hada.subdomain, // Propiedad utilitaria para buscar el UUID de Hada International
    },
  ];

  // 3. Iteramos de forma segura para procesar cada registro de identidad
  for (const userData of initialUsers) {
    // Separamos la propiedad utilitaria del resto de la estructura limpia del Usuario
    const { targetSubdomain, ...cleanUserData } = userData;

    // Validamos la idempotencia buscando si la combinación exacta de nombre y apellido ya existe
    const exists = await userRepository.findOne({
      where: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });

    if (!exists) {
      // 🔍 Buscamos la empresa cliente (Tenant) en la base de datos usando su subdominio único
      const associatedTenant = await tenantRepository.findOne({
        where: { subdomain: targetSubdomain },
      });

      if (!associatedTenant) {
        console.error(
          `❌ Error: No se encontró el Tenant con subdominio '${targetSubdomain}'. Asegúrate de que el seed 02-tenant haya corrido.`,
        );
        continue;
      }

      // Creamos la instancia inyectando el tenantId (columna de tu BaseTenantEntity) y la relación formal
      const newUser = userRepository.create({
        ...cleanUserData,
        tenantId: associatedTenant.id, // Forzamos el ID del Tenant en la columna común de tu multi-tenancy
        tenant: associatedTenant, // Enlazamos la relación de objeto requerida por TypeORM
      });

      // Guardamos en PostgreSQL. Se auto-generará su id (UUID) y marcas de tiempo nativas en UTC
      await userRepository.save(newUser);
      console.log(
        `✅ Usuario registrado exitosamente: ${userData.firstName} ${userData.lastName} (Tenant: ${userData.targetSubdomain})`,
      );
    } else {
      console.log(
        `ℹ️ El usuario '${userData.firstName} ${userData.lastName}' ya se encuentra registrado. Saltando...`,
      );
    }
  }

  console.log('🏁 Proceso de seeding para core_users finalizado con éxito.');
}
