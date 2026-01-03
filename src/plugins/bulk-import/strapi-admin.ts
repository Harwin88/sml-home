export default {
    register(app) {
        app.addMenuLink({
            to: '/plugins/bulk-import',
            icon: () => '🚀',
            intlLabel: {
                id: 'bulk-import.plugin.name',
                defaultMessage: 'Carga Masiva DAM',
            },
            Component: async () => {
                const component = await import('./pages/HomePage');
                return component;
            },
            permissions: [
                // Aquí definiremos los permisos más adelante
            ],
        });
    },
    bootstrap(app) { },
};
