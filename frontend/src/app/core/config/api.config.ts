import { environment } from '../../../environments/environment';

export const API_CONFIG = {
    baseUrl: environment.apiUrl,
    apiPath: '/api',
    endpoints: {
        categories: '/categories',
        serviceProviders: '/service-providers'
    },
    strapiKey: environment.strapiKey
};

export const API_URL = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;
