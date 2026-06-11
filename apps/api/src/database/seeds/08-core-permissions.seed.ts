import { AppDataSource } from '../data-source';
import { TenantComponent } from '../../modules/core/entities/tenant-component.entity';
import { TenantPermission } from '../../modules/core/entities/tenant-permission.entity';
import { TenantRole } from '../../modules/core/entities/tenant-role.entity';
import { TenantRolePermission } from '../../modules/core/entities/tenant-role-permission.entity';
import { TenantUserRole } from '../../modules/core/entities/tenant-user-role.entity';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { SEED_CONFIG } from './seed.config';
import { SystemAccount } from '../../modules/core/entities';

export async function seedCorePermissions() {
  console.log(
    '⏳ Iniciando siembra (Seeding) de Componentes, Permisos, Roles y Asignaciones...',
  );

  const componentRepository = AppDataSource.getRepository(TenantComponent);
  const permissionRepository = AppDataSource.getRepository(TenantPermission);
  const roleRepository = AppDataSource.getRepository(TenantRole);
  const rolePermissionRepository =
    AppDataSource.getRepository(TenantRolePermission);
  const userRoleRepository = AppDataSource.getRepository(TenantUserRole);
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const systemAccountRepository = AppDataSource.getRepository(SystemAccount);

  // 1. MATRIZ MAESTRA GLOBAL DE COMPONENTES Y SUS ACCIONES GRANULARES
  const matrix = [
    {
      code: 'SSOMA',
      name: 'Seguridad, Salud Ocupacional y Medio Ambiente',
      desc: 'Control de riesgos',
      perms: [
        'SSOMA:dashboard:READ',
        'SSOMA:hallazgos:READ',
        'SSOMA:hallazgos:CREATE',
        'SSOMA:hallazgos:UPDATE',
        'SSOMA:hallazgos:DELETE',
        'SSOMA:equipo_proteccion_personal:READ',
        'SSOMA:equipo_proteccion_personal:CREATE',
        'SSOMA:equipo_proteccion_personal:UPDATE',
        'SSOMA:equipo_proteccion_personal:DELETE',
        'SSOMA:inspeccion_extintores:READ',
        'SSOMA:inspeccion_extintores:CREATE',
        'SSOMA:inspeccion_extintores:UPDATE',
        'SSOMA:inspeccion_extintores:DELETE',
      ],
    },
    {
      code: 'GCH',
      name: 'Gestión del Capital Humano',
      desc: 'Administración de personal',
      perms: [
        'GCH:dashboard:READ',
        'GCH:requisicion_personal:READ',
        'GCH:requisicion_personal:CREATE',
        'GCH:requisicion_personal:UPDATE',
        'GCH:requisicion_personal:DELETE',
        'GCH:reporte_incumplimientos:READ',
        'GCH:reporte_incumplimientos:CREATE',
        'GCH:reporte_incumplimientos:UPDATE',
        'GCH:reporte_incumplimientos:DELETE',
        'GCH:colaboradores:READ',
        'GCH:colaboradores:CREATE',
        'GCH:colaboradores:UPDATE',
        'GCH:colaboradores:DELETE',
      ],
    },
    {
      code: 'SEM',
      name: 'Sistema de Ejecución de la Producción',
      desc: 'Control de manufactura',
      perms: ['SEM:dashboard:READ'],
    },
    {
      code: 'SGP',
      name: 'Sistema de Gestión de Patios',
      desc: 'Módulo logístico de accesos',
      perms: [
        'SGP:dashboard:READ',
        'GCH:usuarios:READ',
        'GCH:usuarios:CREATE',
        'GCH:usuarios:UPDATE',
        'GCH:usuarios:DELETE',
        'GCH:registro:CREATE',
      ],
    },
    {
      code: 'SGA',
      name: 'Sistema de Gestión de Almacenes',
      desc: 'WMS estratégico',
      perms: ['SGA:dashboard:READ'],
    },
  ];

  // 2. INYECCIÓN IDEMPOTENTE DE LA INFRAESTRUCTURA DE COMPONENTES Y PERMISOS
  for (const item of matrix) {
    let component = await componentRepository.findOne({
      where: { code: item.code },
    });
    if (!component) {
      component = await componentRepository.save(
        componentRepository.create({
          code: item.code,
          name: item.name,
          description: item.desc,
          isActive: true,
        }),
      );
      console.log(`📦 Componente inyectado: [${component.code}]`);
    }

    for (const pCode of item.perms) {
      const exists = await permissionRepository.findOne({
        where: { code: pCode },
      });
      if (!exists) {
        const actionType = pCode.endsWith('CREATE')
          ? 'CREATE'
          : pCode.endsWith('UPDATE')
            ? 'UPDATE'
            : pCode.endsWith('DELETE')
              ? 'DELETE'
              : 'READ';
        await permissionRepository.save(
          permissionRepository.create({
            code: pCode,
            action: actionType,
            tenantComponentId: component.id,
          }),
        );
      }
    }
  }

  const allSavedPerms = await permissionRepository.find();

  // 3. ESTRUCTURACIÓN DE CONFIGURACIÓN DE SEGURIDAD RELACIONAL POR TENANT
  const targetTenants = [
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain,
      adminEmail: SEED_CONFIG.tenants.trujillo.adminEmail,
    },
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain,
      adminEmail: SEED_CONFIG.tenants.hada.adminEmail,
    },
  ];

  const rolesMatrix = [
    {
      name: 'Administrador',
      isDefault: true,
      codes: matrix.flatMap((c) => c.perms),
    },
    {
      name: 'Supervisor',
      isDefault: false,
      codes: ['SSOMA:hallazgos:READ', 'SSOMA:hallazgos:CREATE'],
    },
    {
      name: 'General',
      isDefault: false,
      codes: [
        'SSOMA:dashboard:READ',
        'SSOMA:hallazgos:READ',
        'SSOMA:equipo_proteccion_personal:READ',
      ],
    },
  ];

  for (const target of targetTenants) {
    const tenant = await tenantRepository.findOne({
      where: { subdomain: target.subdomain },
    });

    if (!tenant) {
      console.error(
        `❌ Fallo: El tenant [${target.subdomain}] no fue encontrado.`,
      );
      continue;
    }

    const account = await systemAccountRepository.findOne({
      where: {
        email: target.adminEmail,
        tenantId: tenant.id, // Nos aseguramos de que pertenezca a la empresa correcta
      },
      relations: {
        user: true, // Traemos el perfil humano asociado para asignarle el rol de admin
      },
    });

    // Extraemos de forma segura el perfil humano verificado por la base de datos
    const userAdmin = account?.user;

    console.log(
      `🏢 Creando matriz de seguridad aislada para Tenant: [${tenant.subdomain.toUpperCase()}]`,
    );

    for (const rDef of rolesMatrix) {
      let role = await roleRepository.findOne({
        where: { name: rDef.name, tenantId: tenant.id },
      });
      if (!role) {
        role = await roleRepository.save(
          roleRepository.create({
            name: rDef.name,
            isSystemDefault: rDef.isDefault,
            tenantId: tenant.id,
          }),
        );
        console.log(`   👥 Rol base inyectado: "${role.name}"`);
      }

      // Filtrado atómico relacional de los privilegios asignados al rol
      const targetPerms = allSavedPerms.filter((p) =>
        rDef.codes.includes(p.code),
      );

      for (const perm of targetPerms) {
        const existsRoleLink = await rolePermissionRepository.findOne({
          where: {
            tenantRoleId: role.id,
            tenantPermissionId: perm.id,
            tenantId: tenant.id,
          },
        });
        if (!existsRoleLink) {
          await rolePermissionRepository.save(
            rolePermissionRepository.create({
              tenantRoleId: role.id,
              tenantPermissionId: perm.id,
              tenantId: tenant.id,
            }),
          );
        }
      }

      // Asignación directa del Rol de Administrador al usuario líder de la empresa
      if (rDef.name === 'Administrador' && userAdmin) {
        const existsUserLink = await userRoleRepository.findOne({
          where: {
            userId: userAdmin.id,
            tenantRoleId: role.id,
            tenantId: tenant.id,
          },
        });
        if (!existsUserLink) {
          await userRoleRepository.save(
            userRoleRepository.create({
              userId: userAdmin.id,
              tenantRoleId: role.id,
              tenantId: tenant.id,
            }),
          );
          console.log(
            `      👤 Privilegio de Administrador asignado a: <${userAdmin.firstName}>`,
          );
        }
      }
    }
  }

  console.log(
    '🏁 Proceso de seeding finalizado con éxito absoluto para el monorepo.',
  );
}
