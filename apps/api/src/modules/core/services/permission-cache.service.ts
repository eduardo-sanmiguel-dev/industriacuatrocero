import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UserPreferences } from '@synergy/types';

@Injectable()
export class PermissionCacheService {
  private readonly logger = new Logger(PermissionCacheService.name);

  // 🚀 ÍNDICE DE RASTREO SEGURO (Nativo de TypeScript, libre de 'any')
  private readonly trackedKeys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private buildKey(
    tenantId: string,
    userId: string,
    type: 'permissions' | 'preferences',
  ): string {
    return `${type}:${tenantId}:${userId}`;
  }

  // --- GESTIÓN DE PERMISOS ---
  async setPermissions(
    tenantId: string,
    userId: string,
    permissions: string[],
  ): Promise<void> {
    const key = this.buildKey(tenantId, userId, 'permissions');
    await this.cacheManager.set(key, permissions);

    // Sincronizamos con nuestro rastreador en RAM
    this.trackedKeys.add(key);
  }

  async getPermissions(
    tenantId: string,
    userId: string,
  ): Promise<string[] | null> {
    const key = this.buildKey(tenantId, userId, 'permissions');
    const data = await this.cacheManager.get<string[]>(key);
    return data ?? null;
  }

  // --- GESTIÓN DE PREFERENCIAS VISUALES ---
  async setPreferences(
    tenantId: string,
    userId: string,
    preferences: UserPreferences,
  ): Promise<void> {
    const key = this.buildKey(tenantId, userId, 'preferences');
    await this.cacheManager.set(key, preferences);

    // Sincronizamos con nuestro rastreador en RAM
    this.trackedKeys.add(key);
  }

  async getPreferences(
    tenantId: string,
    userId: string,
  ): Promise<UserPreferences | null> {
    const key = this.buildKey(tenantId, userId, 'preferences');
    const data = await this.cacheManager.get<UserPreferences>(key);
    return data ?? null;
  }

  // --- INVALIDACIÓN DE CACHÉ SIMÉTRICA ---
  async invalidateUserCache(tenantId: string, userId: string): Promise<void> {
    const permKey = this.buildKey(tenantId, userId, 'permissions');
    const prefKey = this.buildKey(tenantId, userId, 'preferences');

    await this.cacheManager.del(permKey);
    await this.cacheManager.del(prefKey);

    // Removemos las llaves del rastreador
    this.trackedKeys.delete(permKey);
    this.trackedKeys.delete(prefKey);

    this.logger.warn(
      `🗑️ Memoria RAM purgada por completo para el usuario [${userId}]`,
    );
  }

  // --- VOLCADO TOTAL DE DATOS (100% COMPATIBLE CON V7) ---
  async getAllCacheContent(): Promise<Record<string, unknown>> {
    const cacheDump: Record<string, unknown> = {};

    // Iteramos directamente sobre nuestro Set nativo fuertemente tipado
    for (const key of this.trackedKeys) {
      const data = await this.cacheManager.get(key);

      if (data !== undefined && data !== null) {
        cacheDump[key] = data;
      } else {
        // Control defensivo: Si la llave expiró por otra vía, limpiamos el índice
        this.trackedKeys.delete(key);
      }
    }

    return cacheDump;
  }

  /**
   * 📊 MÉTRICA DE MEMORIA REAL (Compatible con cache-manager v7 + Keyv)
   * Calcula el peso exacto de los bytes ocupados por los strings de permisos
   * y los objetos serializados de AG Grid que residen actualmente en la RAM.
   */
  async getCacheMemoryMetrics(): Promise<{ bytes: number; formatted: string }> {
    let totalBytes = 0;

    // Iteramos sobre nuestro Set nativo rastreado de forma segura
    for (const key of this.trackedKeys) {
      const data = await this.cacheManager.get(key);

      if (data !== undefined && data !== null) {
        // Serializamos temporalmente el payload a JSON string para medir sus caracteres físicos en memoria
        const serializedLength = JSON.stringify(data).length;

        // Sumamos los bytes de la llave (texto) + el peso de su payload asignado
        totalBytes += key.length + serializedLength;
      }
    }

    // Transformamos los bytes puros a Kilobytes legibles
    const usedKilobytes = (totalBytes / 1024).toFixed(2);
    this.logger.log(
      `📈 Peso real del payload de seguridad y UI en RAM: ${usedKilobytes} KB`,
    );

    return {
      bytes: totalBytes,
      formatted: `${usedKilobytes} KB`,
    };
  }
}
