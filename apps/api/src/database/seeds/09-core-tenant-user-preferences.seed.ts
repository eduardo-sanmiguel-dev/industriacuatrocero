import { AppDataSource } from '../data-source';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SystemAccount } from '../../modules/core/entities/system-account.entity';
import { TenantUserPreference } from '../../modules/core/entities/tenant-user-preference.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedUserPreferences() {
  console.log(
    '⏳ Iniciando siembra (Seeding) de Preferencias de Usuario y AG Grid (JSONB)...',
  );

  const tenantRepository = AppDataSource.getRepository(Tenant);
  const systemAccountRepository = AppDataSource.getRepository(SystemAccount);
  const preferenceRepository =
    AppDataSource.getRepository(TenantUserPreference);

  // 📝 MATRIZ DE CONFIGURACIÓN CORPORATIVA PARA PRODUCCIÓN
  const targets = [
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain,
      adminEmail: SEED_CONFIG.tenants.trujillo.adminEmail,
      defaultLandingPage: '/ssoma/dashboard', // Trujillo prioriza seguridad de plantas
      themeMode: 'light' as const,
    },
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain,
      adminEmail: SEED_CONFIG.tenants.hada.adminEmail,
      defaultLandingPage: '/gch/dashboard', // Hada prioriza gestión humana
      themeMode: 'dark' as const,
    },
  ];

  for (const target of targets) {
    // 1. Buscamos el Tenant para amarrar el aislamiento multi-tenant
    const tenant = await tenantRepository.findOne({
      where: { subdomain: target.subdomain },
    });

    if (!tenant) {
      console.error(
        `❌ Fallo: El tenant [${target.subdomain}] no fue encontrado en la base de datos.`,
      );
      continue;
    }

    // 2. Buscamos la cuenta de sistema usando tu sintaxis moderna de relaciones booleanas
    const account = await systemAccountRepository.findOne({
      where: { email: target.adminEmail, tenantId: tenant.id },
      relations: { user: true },
    });

    const userAdmin = account?.user;

    if (!userAdmin) {
      console.warn(
        `⚠️ Alerta: No se encontró perfil humano en core_users para <${target.adminEmail}>. Saltando.`,
      );
      continue;
    }

    // 3. VALIDACIÓN DE IDEMPOTENCIA: Verificamos si el usuario ya cuenta con preferencias iniciales
    const existsPreference = await preferenceRepository.findOne({
      where: { userId: userAdmin.id, tenantId: tenant.id },
    });

    if (!existsPreference) {
      // Estado de AG Grid inicial de prueba para tus componentes core
      const defaultAgGridState: Record<string, any> = {
        ssoma_hallazgos: [
          { colId: 'code', width: 120, hide: false, pinned: 'left' },
          { colId: 'description', width: 250, hide: false },
        ],
        gch_colaboradores: [
          { colId: 'first_name', width: 150, hide: false, pinned: 'left' },
          { colId: 'last_name', width: 150, hide: false },
        ],
      };

      // 🚀 SOLUCIÓN DEFINITIVA DE TIPADO:
      // 1. Pasamos el objeto instanciado 'user: userAdmin' en lugar de 'userId: userAdmin.id'
      // 2. Removemos 'updatedBy: null' para que TypeScript no arroje error por tipos opcionales
      const newPreference = preferenceRepository.create({
        user: userAdmin, // Relación uno a uno estricta
        themeMode: target.themeMode,
        defaultLandingPage: target.defaultLandingPage,
        agGridState: defaultAgGridState,
        tenantId: tenant.id,
        createdBy: userAdmin.id,
        // updatedBy se descarta aquí para que el compilador lo asimile como undefined nativo
      });

      await preferenceRepository.save(newPreference);
      console.log(
        `   🎨 Preferencias iniciales [Modo: ${target.themeMode}] inyectadas con éxito para: <${target.adminEmail}>`,
      );
    }
  }

  console.log(
    '🏁 El proceso de seeding para core_tenant_user_preferences finalizó exitosamente.\n',
  );
}
