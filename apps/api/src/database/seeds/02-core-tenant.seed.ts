import { AppDataSource } from '../data-source';
import { Tenant } from '../../modules/core/entities/tenant.entity';
import { Country } from '../../modules/core/entities/country.entity';
import { TenantBrand } from '../../modules/core/entities/tenant-brand.entity'; // 🚀 NUEVO: Importación obligatoria
import { SEED_CONFIG } from './seed.config';

export async function seedTenants() {
  console.log(
    '⏳ Iniciando siembra de datos (Seeding) para core_tenants y core_tenant_brands...',
  );

  // 1. Obtenemos los repositorios de TypeORM incluyendo la nueva tabla estética
  const tenantRepository = AppDataSource.getRepository(Tenant);
  const countryRepository = AppDataSource.getRepository(Country);
  const brandRepository = AppDataSource.getRepository(TenantBrand); // 🚀 NUEVO: Repositorio de Marca Blanca

  // 2. Definimos la información limpia y explícita unificando datos de negocio y diseño de marca blanca
  const initialTenants = [
    {
      subdomain: SEED_CONFIG.tenants.hada.subdomain, // Subdominio único para el ruteo web (ej: ://tuapp.com)
      name: 'Hada International S.A.S.', // Razón social legal del cliente en Colombia
      commercialName: 'Hada International', // Alias comercial público
      taxId: '9003888392', // NIT colombiano sin guiones ni espacios para almacenamiento compacto
      timezone: 'America/Bogota', // Zona horaria IANA oficial de Colombia para marcas de tiempo operativas
      currency: 'COP', // Código de moneda ISO 4217 correspondiente al peso colombiano
      planType: 'PREMIUM' as const, // Nivel de suscripción asignado para habilitar todos los módulos frontends
      targetCountryCode: 'CO', // Propiedad utilitaria para buscar el UUID del país en la base de datos
      // 🎨 CONFIGURACIÓN DE MARCA BLANCA EXCLUSIVA PARA HADA (Logística y distribución)
      brandData: {
        companyLegalName: 'Hada International S.A.S.',
        loginWelcomeText:
          'Bienvenido al ecosistema de Logística y Comercio Exterior de Hada',
        primaryColor: '#00B3AB', // Turquesa vibrante para un contraste moderno y tecnológico
        sidebarBgColor: '#004D65', // Azul profundo para transmitir confianza y profesionalismo en logística internacional
        logoUrl:
          'https://res.cloudinary.com/deqs6yvl4/image/upload/q_auto/f_auto/v1781106433/logo_efsk0x.png',
        faviconUrl:
          'https://res.cloudinary.com/deqs6yvl4/image/upload/q_auto/f_auto/v1781105334/favicon_zsu8kp.png',
      },
    },
    {
      subdomain: SEED_CONFIG.tenants.trujillo.subdomain, // Subdominio único para el ruteo web (ej: ://tuapp.com)
      name: 'Cosméticos Trujillo S.A de C.V', // Razón social legal del cliente en México
      commercialName: 'Cosméticos Trujillo', // Alias comercial público
      taxId: 'TRU260605XYZ', // RFC mexicano en mayúsculas y sin caracteres especiales
      timezone: 'America/Mexico_City', // Zona horaria IANA oficial de la Ciudad de México
      currency: 'MXN', // Código de moneda ISO 4217 correspondiente al peso mexicano
      planType: 'PRO' as const, // Nivel de suscripción profesional
      targetCountryCode: 'MX', // Propiedad utilitaria para buscar el UUID de México
      // 🎨 CONFIGURACIÓN DE MARCA BLANCA EXCLUSIVA PARA TRUJILLO (Fábrica de cosméticos)
      brandData: {
        companyLegalName: 'Cosméticos Trujillo S.A de C.V',
        loginWelcomeText:
          'Panel Corporativo de Manufactura y Aseguramiento de Calidad',
        primaryColor: '#75AD2A', // Verde vibrante para reflejar frescura y naturaleza en cosméticos
        sidebarBgColor: '#646569', // Gris medio para un contraste suave con el verde
        logoUrl:
          'https://res.cloudinary.com/deqs6yvl4/image/upload/q_auto/f_auto/v1781106413/logo_ingspq.png',
        faviconUrl:
          'https://res.cloudinary.com/deqs6yvl4/image/upload/q_auto/f_auto/v1781104725/favicon_wp3xgq.png',
      },
    },
  ];

  // 3. Iteramos de forma segura para procesar cada empresa cliente de forma secuencial
  for (const tenantData of initialTenants) {
    // Separamos las propiedades utilitarias y de marca del resto de la estructura del Tenant
    const { targetCountryCode, brandData, ...cleanTenantData } = tenantData;

    // VALIDACIÓN DE IDEMPOTENCIA: Validamos si el subdominio de la empresa ya ocupa espacio físico
    const exists = await tenantRepository.findOne({
      where: { subdomain: tenantData.subdomain },
    });

    if (!exists) {
      // CLAVE: Buscamos el registro del país en core_countries usando su código único de dos letras
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
        country: associatedCountry, // Asocia la instancia completa del país para que TypeORM extraiga su ID
      });

      // 💾 PASO 1: Guardamos físicamente la empresa madre en PostgreSQL para disparar su ID (UUID)
      const savedTenant = await tenantRepository.save(newTenant);
      console.log(
        `🏢 Tenant registrado exitosamente: ${savedTenant.name} (Subdominio: ${savedTenant.subdomain})`,
      );

      // 💾 PASO 2: Creamos y guardamos la marca blanca en caliente amarrándola al UUID recién generado
      const newBrand = brandRepository.create({
        ...brandData,
        tenantId: savedTenant.id, // Enlace físico multi-tenant directo
        tenant: savedTenant, // Relación formal 1:1
      });

      await brandRepository.save(newBrand);
      console.log(
        `   🎨 Identidad de Marca Blanca inyectada con éxito para [${savedTenant.subdomain}]`,
      );
    } else {
      console.log(
        `ℹ️ El subdominio '${tenantData.subdomain}' ya se encuentra registrado. Saltando...`,
      );
    }
  }

  console.log(
    '🏁 Proceso de seeding para core_tenants y marcas visuales finalizado con éxito.',
  );
}
