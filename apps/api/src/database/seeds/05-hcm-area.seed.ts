import { AppDataSource } from '../data-source';
import { HcmArea } from '../../modules/hcm/entities/area.entity';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SystemAccount } from '../../modules/core/entities/system-account.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedHcmAreas() {
  console.log(
    '⏳ Iniciando siembra de datos (Seeding) para hcm_areas con auditoría de usuarios reales...',
  );

  const areaRepository = AppDataSource.getRepository(HcmArea);
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const systemAccountRepository = AppDataSource.getRepository(SystemAccount);

  // 1. Mapeamos las áreas exclusivas vinculándolas al correo de la cuenta de sistema responsable
  const tenantAreasMapping = [
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain, // Inquilino de manufactura en México
      creatorEmail: SEED_CONFIG.tenants.trujillo.adminEmail, // Cuenta de sistema de Eduardo Dominguez
      areas: [
        'Administración',
        'CALIDAD',
        'COMERCIAL',
        'COMERCIO EXTERIOR',
        'Excelencia',
        'FINANZAS',
        'Gestión Humana',
        'Ingeniería',
        'Innovación y Desarrollo',
        'Logística',
        'Operaciones',
        'Producción',
        'SISTEMA DE GESTION INTEGRAL',
        'SST',
        'Tecnología y Soporte Técnico',
      ],
    },
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain, // Inquilino de logística en Colombia
      creatorEmail: SEED_CONFIG.tenants.hada.adminEmail, // Cuenta de sistema de Victoria Barros
      areas: [],
    },
  ];

  // 2. Iteramos sobre la estructura de mapeo controlado
  for (const mapping of tenantAreasMapping) {
    // 🔍 Buscamos la empresa cliente en la base de datos para extraer su UUID
    const tenant = await tenantRepository.findOne({
      where: { subdomain: mapping.subdomain },
    });

    if (!tenant) {
      console.error(
        `❌ Error: No se encontró el Tenant con subdominio '${mapping.subdomain}'.`,
      );
      continue;
    }

    // 🔍 CLAVE: Buscamos la cuenta de sistema cargando de forma estricta su relación con el usuario madre
    const systemAccount = await systemAccountRepository.findOne({
      where: { email: mapping.creatorEmail },
      relations: { user: true }, // Forzamos el JOIN con core_users para obtener la identidad
    });

    if (!systemAccount || !systemAccount.user) {
      console.error(
        `❌ Error: No se encontró la cuenta o el usuario para el correo '${mapping.creatorEmail}'. Asegúrate de que el seed 04 haya corrido.`,
      );
      continue;
    }

    console.log(
      `📦 Procesando áreas para [${tenant.subdomain}] asignando como creador a: [${systemAccount.email}]`,
    );

    for (const name of mapping.areas) {
      // VALIDACIÓN DE IDEMPOTENCIA: Evita duplicar el nombre estrictamente dentro de este tenant_id
      const exists = await areaRepository.findOne({
        where: {
          tenantId: tenant.id,
          name: name,
        },
      });

      if (!exists) {
        // Creamos la instancia cumpliendo con la obligatoriedad estricta de createdBy
        const newArea = areaRepository.create({
          name: name,
          tenantId: tenant.id, // Aislamiento multi-tenant
          createdBy: systemAccount.user.id as string, // 🚀 REGLA APLICADA: Extrae e inyecta el ID puro del usuario Eduardo o Victoria
        });

        // Guardamos físicamente en PostgreSQL en formato UTC
        await areaRepository.save(newArea);
        console.log(
          `   ✅ Área registrada: "${name}" (Creador UUID: ${systemAccount.user.id})`,
        );
      } else {
        console.log(
          `   ℹ️ El área "${name}" ya se encuentra registrada para [${tenant.subdomain}]. Saltando...`,
        );
      }
    }
  }

  console.log('🏁 Proceso de seeding para hcm_areas finalizado con éxito.');
}
