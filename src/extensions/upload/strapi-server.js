module.exports = (plugin) => {
  // 1. Inyectamos el atributo al modelo de datos
  plugin.contentTypes.file.attributes.sku = {
    type: 'string',
    configurable: false,
  };

  // 2. Configuramos cómo se debe ver en el Admin (Metadata)
  // Esto ayuda a que el Content Manager sepa que debe mostrarlo
  if (plugin.contentTypes.file.metadatas) {
    plugin.contentTypes.file.metadatas.sku = {
      edit: {
        label: 'SKU del Producto',
        description: 'Ingresa el código SKU para agrupar esta imagen',
        placeholder: 'Ej: ABC-123',
        visible: true,
        editable: true,
      },
      list: {
        label: 'SKU',
        sortable: true,
        filterable: true,
      },
    };
  }

  return plugin;
};