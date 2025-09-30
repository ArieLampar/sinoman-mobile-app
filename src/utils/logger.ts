interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

const isDevelopment = __DEV__;

const formatMessage = (level: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

export const logger: Logger = {
  debug: (message: string, ...args: any[]): void => {
    if (isDevelopment) {
      console.log(formatMessage('DEBUG', message), ...args);
    }
  },

  info: (message: string, ...args: any[]): void => {
    console.info(formatMessage('INFO', message), ...args);
  },

  warn: (message: string, ...args: any[]): void => {
    console.warn(formatMessage('WARN', message), ...args);
  },

  error: (message: string, ...args: any[]): void => {
    console.error(formatMessage('ERROR', message), ...args);
    // TODO: Send to Sentry in production
  },
};