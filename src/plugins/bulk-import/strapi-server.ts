import myController from './server/controllers/my-controller';

export default {
    register({ strapi }) { },
    bootstrap({ strapi }) { },
    destroy({ strapi }) { },
    config: {
        default: {},
        validator() { },
    },
    controllers: {
        myController,
    },
    routes: [
        {
            method: 'GET',
            path: '/',
            handler: 'myController.index',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/process-uploads',
            handler: 'myController.processUploads',
            config: {
                policies: [],
            },
        }
    ],
    services: {
        myService: ({ strapi }) => ({
            getWelcomeMessage() {
                return 'Welcome to Bulk Import Plugin 🚀';
            },
        }),
    },
    contentTypes: {},
    policies: {},
    middlewares: {},
};
