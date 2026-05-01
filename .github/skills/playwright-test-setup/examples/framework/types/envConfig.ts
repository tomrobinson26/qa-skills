/**
 * Environment configuration type definition
 * Add new environment variables here and implement them in each environment file
 */
export interface envConfig {
  baseUrl: string;
  apiUrl?: string;
  // Add additional environment-specific properties as needed
  // Example:
  // authToken?: string;
  // timeout?: number;
}
