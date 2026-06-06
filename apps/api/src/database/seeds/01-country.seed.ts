import { AppDataSource } from '../data-source';
import { Country } from '../../modules/core/entities/country.entity';

export async function seedCountries() {
  console.log('⏳ Iniciando siembra de datos (Seeding) para core_countries...');

  const countryRepository = AppDataSource.getRepository(Country);

  // 🚀 REGLA DE NEGOCIO: Eliminamos el 'id' manual para dejar que Postgres genere el UUID automáticamente
  const initialCountries = [
    {
      countryCode: 'MX', // Identificador ISO de 2 letras con restricción única en la base de datos
      name: 'México', // Nombre oficial del territorio mexicano
      phoneCode: '+52', // Prefijo telefónico internacional de México
      currencyCode: 'MXN', // Código internacional de la moneda local
    },
    {
      countryCode: 'CO', // Identificador ISO de 2 letras para Colombia
      name: 'Colombia', // Nombre oficial del territorio colombiano
      phoneCode: '+57', // Prefijo telefónico internacional de Colombia
      currencyCode: 'COP', // Código internacional de la moneda colombiana
    },
  ];

  // Iteramos de forma segura buscando por la columna de texto única
  for (const countryData of initialCountries) {
    // 🔍 CLAVE: Buscamos en la base de datos comparando por countryCode, no por el id UUID
    const exists = await countryRepository.findOne({
      where: { countryCode: countryData.countryCode },
    });

    if (!exists) {
      // Creamos la instancia de la entidad respetando la herencia de BaseAuditEntity
      const newCountry = countryRepository.create(countryData);

      // Guardamos físicamente en Postgres. Generará el id (UUID) y las marcas de tiempo automáticamente
      await countryRepository.save(newCountry);
      console.log(`✅ País registrado exitosamente: ${countryData.name}`);
    } else {
      console.log(
        `ℹ️ El país ${countryData.name} ya se encuentra registrado. Saltando...`,
      );
    }
  }

  console.log(
    '🏁 Proceso de seeding para core_countries finalizado con éxito.',
  );
}
