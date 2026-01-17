import { ConfigService } from '../services/config.service';

export const API_CONFIG = {
    apiPath: '/api',
    endpoints: {
        categories: '/categories',
        serviceProviders: '/service-providers',
        featuredProviders: '/featured-providers'
    }
};

export function getApiUrl(configService: ConfigService): string {
    return `${configService.apiUrl}${API_CONFIG.apiPath}`;
}
