import { AppDataSource } from '../data-source';
import { HcmJob } from '../../modules/hcm/entities/job.entity';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SystemAccount } from '../../modules/core/entities/system-account.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedHcmJobs() {
  console.log(
    '⏳ Iniciando siembra de datos (Seeding) masiva y segmentada para hcm_jobs...',
  );

  const jobRepository = AppDataSource.getRepository(HcmJob);
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const systemAccountRepository = AppDataSource.getRepository(SystemAccount);

  // 1. Mapeamos y distribuimos la lista masiva de puestos según el modelo de negocio de cada Tenant
  const tenantJobsMapping = [
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain, // Foco: Producción química, manufactura de cosméticos y laboratorios
      creatorEmail: SEED_CONFIG.tenants.trujillo.adminEmail,
      jobs: [
        'Analista Calidad N1',
        'Analista Control de Calidad',
        'Analista de Aseguramiento de Calidad',
        'Analista de Calidad',
        'Analista de Comercio Exterior',
        'Analista de Desarrollo de Empaques',
        'Analista de Embarques',
        'Analista de Excelencia Corporativa',
        'Analista de Impuestos',
        'Analista de Información',
        'Analista de Innovación',
        'Analista de Inventarios',
        'Analista de Nomina N1',
        'Analista de Nomina',
        'Analista de Soporte TIC',
        'Analista de Tesoreria',
        'Analista de validaciones',
        'Auxiliar Administrativo de Logística',
        'Auxiliar Administrativo Logistica',
        'Auxiliar Administrativo Logística',
        'Auxiliar Administrativo',
        'Auxiliar Contable',
        'Auxiliar Control de Calidad N1 Empaque',
        'Auxiliar de Almacén de Refacciones',
        'Auxiliar de Calidad N1',
        'Auxiliar de Calidad',
        'Auxiliar de Gestion Humana',
        'Auxiliar de Impuestos',
        'Auxiliar de Innovación y Desarrollo',
        'Auxiliar de Inventarios',
        'Auxiliar de Logistica',
        'Auxiliar de Sistema de Gestión',
        'Becaria de Ingenieria Locativa',
        'Becario Contable',
        'Becario de Mantenimiento',
        'Becario de Proyectos',
        'Becario Logistica',
        'Coordinador Comercial',
        'Coordinador de Automatizacion',
        'Coordinador de Cadena de suministro',
        'Coordinador de Control de Calidad',
        'Coordinador de Documentacion',
        'Coordinador de Gestion Humana',
        'Coordinador de Innovación y desarrollo',
        'Coordinador de Mantenimiento y Confiabil',
        'Coordinador de Mantenimiento',
        'Coordinador de Planeación',
        'Coordinador de Producción',
        'Coordinador de Seguridad y Salud en el T',
        'Coordinador Puesta a Punto',
        'Delegada Sindical',
        'Desarrollador de Empaques',
        'Director de Operaciones',
        'Ejecutiva de ventas',
        'Gerente Administrativo',
        'Gerente de Produccion',
        'Ingeniero de Procesos',
        'Jefe de Administración Tributaria',
        'Jefe de Calidad',
        'Jefe de Contabilidad',
        'Jefe de Excelencia Corporativa',
        'Jefe de Gestión Humana',
        'Jefe de Logistica',
        'Jefe de Mantenimiento',
        'Jefe de Proyectos',
        'Jefe Sistema de Gestión',
        'Medico Laboral',
        'Operador Administrativo de Ingeniería',
        'Operador de Acabado',
        'Operador de desarrollo tecnico',
        'Operador de Empaque  Encelofanadora',
        'Operador de empaque Liquidos',
        'Operador de Empaque',
        'Operador de Ingenieria',
        'Operador de Mezclado',
        'Operador de Montacargas',
        'Operador Líder de Maceraciones',
        'Operario Ayudante de Mezclado',
        'Operario de Aseo',
        'Operario de Calidad',
        'Operario Documental',
        'Operario General',
        'Operario Logistico',
        'Supervisor de Logística',
        'Supervisor de Producción',
      ],
    },
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain, // Foco: Cadena de suministro, comercio internacional, logística y finanzas
      creatorEmail: SEED_CONFIG.tenants.hada.adminEmail,
      jobs: [],
    },
  ];

  // 2. Iteramos sobre nuestra estructura de mapeo controlado
  for (const mapping of tenantJobsMapping) {
    const tenant = await tenantRepository.findOne({
      where: { subdomain: mapping.subdomain },
    });

    if (!tenant) {
      console.error(
        `❌ Error: No se encontró el Tenant con subdominio '${mapping.subdomain}'.`,
      );
      continue;
    }

    // Buscamos la cuenta de sistema forzando el JOIN para asegurar el ID del creador real
    const systemAccount = await systemAccountRepository.findOne({
      where: { email: mapping.creatorEmail },
      relations: { user: true },
    });

    if (!systemAccount || !systemAccount.user) {
      console.error(
        `❌ Error: No se encontró la cuenta o el usuario para el correo '${mapping.creatorEmail}'.`,
      );
      continue;
    }

    console.log(
      `📦 Procesando puestos exclusivos para [${tenant.subdomain}] creado por [${systemAccount.email}]`,
    );

    for (const name of mapping.jobs) {
      // VALIDACIÓN DE IDEMPOTENCIA: Evita duplicados del nombre estrictamente dentro de este tenant_id
      const exists = await jobRepository.findOne({
        where: {
          tenantId: tenant.id,
          name: name,
        },
      });

      if (!exists) {
        // Creamos la instancia cumpliendo con la obligatoriedad estricta de createdBy heredada
        const newJob = jobRepository.create({
          name: name,
          tenantId: tenant.id,
          createdBy: systemAccount.user.id as string, // Cast seguro para evitar falsos positivos del linter
        });

        await jobRepository.save(newJob);
        console.log(`   ✅ Puesto registrado: "${name}"`);
      } else {
        console.log(
          `   ℹ️ El puesto "${name}" ya existe para [${tenant.subdomain}]. Saltando...`,
        );
      }
    }
  }

  console.log('🏁 Proceso de seeding para hcm_jobs finalizado con éxito.');
}
