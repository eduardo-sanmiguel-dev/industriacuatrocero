import { AppDataSource } from '../data-source';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { Country } from '../../modules/core/entities/country.entity';
import { SEED_CONFIG } from './seed.config';

export async function seedTenants() {
  console.log('⏳ Iniciando siembra de datos (Seeding) para core_tenants...');

  // 1. Obtenemos los repositorios necesarios de TypeORM
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const countryRepository = AppDataSource.getRepository(Country);

  // 2. Definimos la información limpia y explícita para los dos clientes iniciales
  const initialTenants = [
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain, // Subdominio único para el ruteo web (://example.com)
      name: 'Hada International S.A.S', // Razón social legal del cliente en Colombia
      commercialName: 'Hada International', // Alias comercial público
      taxId: '9003888392', // NIT colombiano sin guiones ni espacios para almacenamiento compacto
      timezone: 'America/Bogota', // Zona horaria IANA oficial de Colombia para marcas de tiempo operativas
      currency: 'COP', // Código de moneda ISO 4217 correspondiente al peso colombiano
      planType: 'PREMIUM' as const, // Nivel de suscripción asignado para habilitar todos los módulos frontends
      targetCountryCode: 'CO', // Propiedad utilitaria para buscar el UUID del país en la base de datos
    },
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain, // Subdominio único para el ruteo web (://example.com)
      name: 'Cosméticos Trujillo S.A de C.V', // Razón social legal del cliente en México
      commercialName: 'Cosméticos Trujillo', // Alias comercial público
      taxId: 'TRU260605XYZ', // RFC mexicano en mayúsculas y sin caracteres especiales
      timezone: 'America/Mexico_City', // Zona horaria IANA oficial de la Ciudad de México
      currency: 'MXN', // Código de moneda ISO 4217 correspondiente al peso mexicano
      planType: 'PRO' as const, // Nivel de suscripción profesional
      targetCountryCode: 'MX', // Propiedad utilitaria para buscar el UUID de México
    },
  ];

  // 3. Iteramos de forma segura para procesar cada empresa cliente
  for (const tenantData of initialTenants) {
    // Separamos la propiedad utilitaria del resto de la estructura del Tenant
    const { targetCountryCode, ...cleanTenantData } = tenantData;

    // Validamos la idempotencia buscando si el subdominio ya está ocupado
    const exists = await tenantRepository.findOne({
      where: { subdomain: tenantData.subdomain },
    });

    if (!exists) {
      // 🔍 CLAVE: Buscamos el registro del país en core_countries usando su código único de dos letras
      const associatedCountry = await countryRepository.findOne({
        where: { countryCode: targetCountryCode },
      });

      if (!associatedCountry) {
        console.error(
          `❌ Error: No se encontró el país maestro con código '${targetCountryCode}'. Debes ejecutar primero el seed de países.`,
        );
        continue;
      }

      // Creamos la instancia unificada inyectando la relación física del país (Foreign Key UUID)
      const newTenant = tenantRepository.create({
        ...cleanTenantData,
        country: associatedCountry, // Asocia la instancia completa del país para que TypeORM extraiga su id
      });

      // Guardamos en PostgreSQL. Se auto-generará el id (UUID) y las marcas de tiempo nativas en UTC
      await tenantRepository.save(newTenant);
      console.log(
        `✅ Tenant registrado exitosamente: ${tenantData.name} (Subdominio: ${tenantData.subdomain})`,
      );
    } else {
      console.log(
        `ℹ️ El subdominio '${tenantData.subdomain}' ya se encuentra registrado. Saltando...`,
      );
    }
  }

  console.log('🏁 Proceso de seeding para core_tenants finalizado con éxito.');
}
