/**
 * Service Provider lifecycles
 * Normaliza automáticamente los campos name_normalized y description_normalized
 * cuando se crea o actualiza un proveedor de servicio
 */

/**
 * Normaliza un texto removiendo tildes y caracteres especiales
 * @param text - Texto a normalizar
 * @returns Texto normalizado
 */
function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .normalize('NFD') // Descompone los caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos (tildes)
    .toLowerCase() // Convierte a minúsculas
    .trim(); // Elimina espacios al inicio y final
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    
    // Normalizar name si existe
    if (data.name) {
      data.name_normalized = normalizeText(data.name);
    }
    
    // Normalizar description si existe
    if (data.description) {
      data.description_normalized = normalizeText(data.description);
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    
    // Normalizar name si existe y ha cambiado
    if (data.name !== undefined) {
      data.name_normalized = normalizeText(data.name);
    }
    
    // Normalizar description si existe y ha cambiado
    if (data.description !== undefined) {
      data.description_normalized = normalizeText(data.description);
    }
  },
};

