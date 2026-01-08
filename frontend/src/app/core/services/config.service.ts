import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  strapiKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;

  constructor(private http: HttpClient) { }

  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.configPromise) {
      return this.configPromise;
    }

    this.configPromise = firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    ).then(config => {
      this.config = config;
      return config;
    }).catch(error => {
      console.error('Error loading configuration:', error);
      throw new Error('Failed to load application configuration');
    });

    return this.configPromise;
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  get apiUrl(): string {
    return this.getConfig().apiUrl;
  }

  get strapiKey(): string {
    return this.getConfig().strapiKey;
  }
}
