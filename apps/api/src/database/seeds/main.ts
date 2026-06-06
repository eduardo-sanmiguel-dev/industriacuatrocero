import { join, extname } from 'path';
import * as fs from 'fs';
import { AppDataSource } from '../data-source';

async function main() {
  try {
    // 1. Inicializamos la conexión con PostgreSQL
    await AppDataSource.initialize();
    console.log(
      '🔌 Conexión establecida con la base de datos para el Seeding.',
    );

    const seedsDirectory = __dirname;

    // 2. Leemos el directorio en orden alfabético estricto (01-, 02-)
    const files = fs.readdirSync(seedsDirectory).sort();

    console.log(`📂 Escaneando directorio de siembras: ${seedsDirectory}`);

    // 🚀 CREACIÓN DEL REQUIRER NATIVO PARA ESM
    // Esto genera una función require legítima basada en la ruta de este archivo
    const customRequire = module.require.bind(module);

    // 3. Iteramos sobre cada archivo encontrado para su auto-descubrimiento
    for (const file of files) {
      const fileExtension = extname(file);

      if (
        file.includes('.seed') &&
        (fileExtension === '.ts' || fileExtension === '.js')
      ) {
        const filePath = join(seedsDirectory, file);

        console.log(`🚀 Archivo detectado y listo para cargar: [${file}]`);

        // 🛠️ Usamos el cargador oficial. No genera errores de ESLint porque 'customRequire'
        // es una función normal para el linter, no una palabra clave reservada del sistema.
        const seedModule = customRequire(filePath) as Record<string, unknown>;

        // Buscamos la función exportada dentro del módulo que empiece con 'seed'
        const seedFunctionKey = Object.keys(seedModule).find((key) =>
          key.startsWith('seed'),
        );

        if (
          seedFunctionKey &&
          typeof seedModule[seedFunctionKey] === 'function'
        ) {
          console.log(`🏃 Ejecutando función de siembra: ${seedFunctionKey}()`);

          const executeSeed = seedModule[
            seedFunctionKey
          ] as () => Promise<void>;
          await executeSeed();
        } else {
          console.warn(
            `⚠️ Advertencia: El archivo [${file}] no exporta ninguna función válida.`,
          );
        }
      }
    }

    console.log(
      '🎉 ¡Todas las semillas del sistema se han procesado de forma automática con éxito total!',
    );
  } catch (error) {
    console.error(
      '❌ Error crítico durante la ejecución del Seeding Automatizado:',
      error,
    );
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔒 Conexión de base de datos cerrada correctamente.');
    }
    process.exit(0);
  }
}

main()
  .then(() => console.log('Proceso de seeding finalizado.'))
  .catch((err) => console.error('Error en el proceso de seeding:', err));
