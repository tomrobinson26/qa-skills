import { envConfig } from '../types/envConfig';
import { qaConfig } from '../config/environments/qa';
import { stagingConfig } from '../config/environments/staging';
import { prodConfig } from '../config/environments/prod';

const environments: { [key: string]: envConfig } = {
  qa: qaConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

export class EnvironmentManager {
  readonly currentEnv: string;
  readonly config: envConfig;

  constructor() {
    this.currentEnv = process.env.ENV || 'qa';
    this.config = environments[this.currentEnv];

    if (!this.config) {
      throw new Error(`Unknown environment: ${this.currentEnv}. Env value is ${process.env.ENV}`);
    }
  }

  getValue(key: keyof envConfig) {
    return this.config[key];
  }

  getEnv() {
    return this.currentEnv;
  }

  isProd() {
    return this.getEnv().includes('prod');
  }
}

module.exports = { EnvironmentManager };
