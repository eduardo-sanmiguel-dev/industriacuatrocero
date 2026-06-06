import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks'; // 🚀 Nativo de Node.js de alta velocidad

@Injectable()
export class TenantContextService {
  // Instancia única del contenedor de almacenamiento local asíncrono
  private static readonly als = new AsyncLocalStorage<Map<string, string>>();

  /**
   * Envuelve la ejecución de la petición dentro de un contexto aislado
   */
  run(tenantId: string, callback: () => void) {
    const store = new Map<string, string>();
    store.set('tenantId', tenantId);
    TenantContextService.als.run(store, callback);
  }

  /**
   * 🔓 LA LLAVE MÁGICA: Cualquier servicio llama a esta función para obtener el inquilino actual
   */
  getTenantId(): string {
    const store = TenantContextService.als.getStore();
    const tenantId = store?.get('tenantId');

    if (!tenantId) {
      throw new Error(
        '❌ Error Crítico: Se intentó realizar una operación en la base de datos sin contexto Multi-tenant.',
      );
    }

    return tenantId;
  }
}
