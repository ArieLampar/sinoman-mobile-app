import { logger } from '../logger';
import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore console mocks for logger tests
    global.console = {
      ...global.console,
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalledWith('[INFO]', 'Test info message');
    });

    it('should log info with multiple arguments', () => {
      logger.info('User action:', { userId: '123' });
      expect(console.log).toHaveBeenCalledWith('[INFO]', 'User action:', { userId: '123' });
    });

    it('should add breadcrumb to Sentry', () => {
      logger.info('Test breadcrumb');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'info',
        message: 'Test breadcrumb',
        level: 'info',
      });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'Test warning');
    });

    it('should add warning breadcrumb to Sentry', () => {
      logger.warn('Test warning');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'warning',
        message: 'Test warning',
        level: 'warning',
      });
    });

    it('should capture warning in Sentry', () => {
      logger.warn('Critical warning');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('Critical warning', 'warning');
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Test error');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Test error');
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error object');
      logger.error('Error occurred:', error);
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Error occurred:', error);
    });

    it('should capture error in Sentry', () => {
      const error = new Error('Test error');
      logger.error('Error:', error);
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should add error breadcrumb to Sentry', () => {
      logger.error('Test error');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'error',
        message: 'Test error',
        level: 'error',
      });
    });
  });

  describe('debug', () => {
    it('should log debug message in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Test debug');
      expect(console.log).toHaveBeenCalledWith('[DEBUG]', 'Test debug');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.debug('Test debug');
      expect(console.log).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('performance', () => {
    it('should log performance metrics', () => {
      logger.performance('API Call', 1500);
      expect(console.log).toHaveBeenCalledWith('[PERF]', 'API Call', '1500ms');
    });

    it('should add performance breadcrumb to Sentry', () => {
      logger.performance('Screen Load', 2000);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'performance',
        message: 'Screen Load - 2000ms',
        level: 'info',
      });
    });
  });

  describe('network', () => {
    it('should log network requests', () => {
      logger.network('GET', '/api/users', 200);
      expect(console.log).toHaveBeenCalledWith('[NETWORK]', 'GET /api/users', 200);
    });

    it('should add network breadcrumb to Sentry', () => {
      logger.network('POST', '/api/login', 201);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'http',
        data: {
          method: 'POST',
          url: '/api/login',
          status_code: 201,
        },
        level: 'info',
      });
    });

    it('should log failed network requests', () => {
      logger.network('GET', '/api/data', 500);
      expect(console.log).toHaveBeenCalledWith('[NETWORK]', 'GET /api/data', 500);
    });
  });

  describe('user', () => {
    it('should log user actions', () => {
      logger.user('login', { userId: '123' });
      expect(console.log).toHaveBeenCalledWith('[USER]', 'login', { userId: '123' });
    });

    it('should add user action breadcrumb to Sentry', () => {
      logger.user('purchase', { amount: 50000 });
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'user',
        message: 'purchase',
        data: { amount: 50000 },
        level: 'info',
      });
    });
  });
});
