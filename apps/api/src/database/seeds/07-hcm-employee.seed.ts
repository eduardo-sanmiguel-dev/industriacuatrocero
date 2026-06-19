import { AppDataSource } from '../data-source';
import { HcmEmployee } from '../../modules/hcm/entities/employee.entity';
import { HcmJob } from '../../modules/hcm/entities/job.entity';
import { HcmArea } from '../../modules/hcm/entities/area.entity';
import { User } from '../../modules/core/entities/user.entity';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SEED_CONFIG } from './seed.config';

// 🚀 IMPORTACIÓN DINÁMICA DEL JSON EXTERNO
import empleadosDB from './empleados_db.json';

// Interfaz estricta para tipar el JSON crudo de entrada según tu captura
interface EmpleadoSeparado {
  codigoempleado: string | number;
  numerosegurosocial: string;
  sexo: string;
  fechaalta: string;
  nombre: string;
  apellidos: string;
  descripcion1: string; // Representa el Puesto (Job)
  descripcion: string; // Representa el Área
}

export async function seedHcmEmployees() {
  console.log(
    '⏳ Iniciando siembra de datos (Seeding) masiva desde JSON para hcm_employees...',
  );

  const employeeRepository = AppDataSource.getRepository(HcmEmployee);
  const jobRepository = AppDataSource.getRepository(HcmJob);
  const areaRepository = AppDataSource.getRepository(HcmArea);
  const userRepository = AppDataSource.getRepository(User);
  const tenantRepository = AppDataSource.getRepository(Tenant);

  // 1. Buscamos el Tenant por defecto (Trujillo) definido en tu estrategia de configuración centralizada
  const tenant = await tenantRepository.findOne({
    where: { subdomain: SEED_CONFIG.tenants.trujillo.subdomain },
  });

  if (!tenant) {
    console.error(
      `❌ Error: No se encontró el Tenant con subdominio '${SEED_CONFIG.tenants.trujillo.subdomain}'.`,
    );
    return;
  }

  // 2. Mapeamos la información de las fichas laborales iniciales aplicando las transformaciones de tu captura
  const dbClean = empleadosDB as EmpleadoSeparado[];
  const initialEmployees = dbClean.map((employee) => ({
    tenantSubdomain: SEED_CONFIG.tenants.trujillo.subdomain,
    employeeCode: String(employee.codigoempleado),
    governmentId: employee.numerosegurosocial,
    biologicalSex:
      employee.sexo === 'M' ? ('MALE' as const) : ('FEMALE' as const),
    hireDate: new Date(employee.fechaalta.split(' ')[0]),
    targetUserFirstName: employee.nombre.trim(),
    targetUserLastName: employee.apellidos.trim(),
    targetJobName: employee.descripcion1.trim(),
    targetAreaName: employee.descripcion.trim(),
  }));

  // 3. Iteramos secuencialmente sobre el arreglo limpio para asegurar la integridad referencial
  for (const empData of initialEmployees) {
    // VALIDACIÓN DE IDEMPOTENCIA: Validamos si la ficha de nómina ya existe en este Tenant
    const employeeExists = await employeeRepository.findOne({
      where: {
        tenantId: tenant.id,
        employeeCode: empData.employeeCode,
      },
    });

    if (employeeExists) {
      console.log(
        `   ℹ️ El empleado con código '${empData.employeeCode}' ya existe. Saltando...`,
      );
      continue;
    }

    // 🔍 Buscamos si la identidad ya existe en la tabla madre core_users
    let associatedUser = await userRepository.findOne({
      where: {
        tenantId: tenant.id,
        firstName: empData.targetUserFirstName,
        lastName: empData.targetUserLastName,
      },
    });

    // 🚀 REGLA DE NEGOCIO: Si la identidad no existe en core_users, la creamos en caliente
    if (!associatedUser) {
      console.log(
        `   ➕ Identidad no encontrada. Creando usuario intermedio: ${empData.targetUserFirstName} ${empData.targetUserLastName}`,
      );

      const newUser = userRepository.create({
        firstName: empData.targetUserFirstName,
        lastName: empData.targetUserLastName,
        tenantId: tenant.id,
        tenant: tenant,
      });

      // Guardamos la identidad y recuperamos su UUID recién generado por PostgreSQL
      associatedUser = await userRepository.save(newUser);
    }

    // 🔍 Buscamos el puesto correspondiente precargado en hcm_jobs
    const associatedJob = await jobRepository.findOne({
      where: {
        tenantId: tenant.id,
        name: empData.targetJobName,
      },
    });

    // 🔍 Buscamos el área correspondiente precargada en hcm_areas
    const associatedArea = await areaRepository.findOne({
      where: {
        tenantId: tenant.id,
        name: empData.targetAreaName,
      },
    });

    // Control defensivo estricto: El área y puesto deben existir previamente en sus respectivos catálogos
    if (!associatedJob || !associatedArea) {
      console.error(
        `   ❌ Error: No se encontró el puesto ("${empData.targetJobName}") o el área ("${empData.targetAreaName}") en los catálogos de [${tenant.subdomain}].`,
      );
      continue;
    }

    // 4. Creamos la ficha de empleado inyectando el creador obligatorio con cast seguro
    const userIdStr = associatedUser.id;
    const newEmployee = employeeRepository.create({
      employeeCode: empData.employeeCode,
      governmentId: empData.governmentId,
      biologicalSex: empData.biologicalSex,
      hireDate: empData.hireDate,
      tenantId: tenant.id,
      jobId: associatedJob.id,
      job: associatedJob,
      areaId: associatedArea.id,
      area: associatedArea,
      user: associatedUser,
      createdBy: userIdStr, // ⚡ Cumple con la obligatoriedad: El usuario es el dueño de su propia creación inicial
    });

    // Guardamos físicamente en la base de datos en formato UTC
    await employeeRepository.save(newEmployee);
    console.log(
      `   ✅ Ficha laboral y enlace core_users creados con éxito para código: ${empData.employeeCode}`,
    );
  }

  console.log('🏁 Proceso de siembra masiva desde JSON finalizado con éxito.');
}
