import express from 'express';
import { config } from './utils/config.js';

const app = express();

// Load and validate configuration
try {
  // Validate required configuration for production
  if (config.isProduction()) {
    config.validateRequired(['JWT_SECRET']);
  }
  
  console.log(`🔧 Environment: ${config.get('NODE_ENV')}`);
  console.log(`🔧 Log Level: ${config.get('LOG_LEVEL')}`);
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  process.exit(1);
}

// Get server configuration
const serverConfig = config.getServerConfig();

// Middleware
app.use(express.json());

// CORS middleware using configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', serverConfig.cors.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', serverConfig.cors.credentials);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Health check endpoint with configuration info
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.get('NODE_ENV'),
    config: {
      port: serverConfig.port,
      logLevel: config.get('LOG_LEVEL'),
      apiTimeout: config.get('API_TIMEOUT'),
      rateLimit: serverConfig.rateLimit,
      // Only show sensitive info in development
      ...(config.isDevelopment() && {
        allConfig: config.getAll()
      })
    }
  });
});

// Configuration endpoint (development only)
if (config.isDevelopment()) {
  app.get('/api/v1/config', (req, res) => {
    res.json({
      success: true,
      data: {
        environment: config.get('NODE_ENV'),
        server: serverConfig,
        database: config.getDatabaseConfig(),
        isDevelopment: config.isDevelopment(),
        isProduction: config.isProduction(),
        isTest: config.isTest()
      },
      message: 'Configuration retrieved (development only)'
    });
  });
}

// Basic API endpoint
app.get('/api/v1/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
    message: 'Users retrieved successfully',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

// Start server
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(serverConfig.port, () => {
    console.log(`🚀 Server running on port ${serverConfig.port}`);
    console.log(`🏥 Health check: http://localhost:${serverConfig.port}/health`);
    
    if (config.isDevelopment()) {
      console.log(`⚙️  Configuration: http://localhost:${serverConfig.port}/api/v1/config`);
    }
    
    console.log(`📊 CORS Origin: ${serverConfig.cors.origin}`);
    console.log(`⏱️  API Timeout: ${config.get('API_TIMEOUT')}ms`);
  });
}

export default app;
