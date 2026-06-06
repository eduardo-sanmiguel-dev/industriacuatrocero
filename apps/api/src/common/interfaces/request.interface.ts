import { Request } from 'express';

// 🚀 EXTENSIÓN DE TIPOS: Añadimos la propiedad de forma estricta al Request global de Express
export interface TenantRequest extends Request {
  tenantId: string; // Almacenará el UUID limpio extraído de la base de datos
}
