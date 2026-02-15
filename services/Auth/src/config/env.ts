export function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (required && (!value || value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value!;
}

export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];

  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }

  const num = Number(value);

  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(
      `Environment variable ${key} must be a valid positive number`,
    );
  }

  return num;
}
