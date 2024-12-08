import express, { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { KiltDidResolver, ResolutionError, ServerError } from './services/KiltDidResolver';
import { DidResolver } from './services/DidResolver';
import { config } from './config';

export const createApp = (resolver: DidResolver) => {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'Please try again later'
    }
  });

  // Apply rate limiting to all routes
  app.use(limiter);

  // JSON parsing
  app.use(express.json());

  // Basic health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Match PLC directory URL format exactly
  app.get('/:did', function(req, res) {
    const did = req.params.did;
    
    if (!did.startsWith('did:kilt:') && !did.startsWith('did:plc:')) {
      res.status(400).json({
        error: 'Invalid DID format',
        message: 'DID must start with did:kilt: or did:plc:'
      });
      return;
    }

    resolver.resolveDid(did)
      .then(doc => {
        res.json(doc);
      })
      .catch(error => {
        console.error('Error processing request:', error);
        
        if (error instanceof ResolutionError || error.message === 'DID not found') {
          res.status(404).json({
            error: 'DID not found',
            message: 'The specified DID could not be resolved'
          });
          return;
        }

        res.status(500).json({ 
          error: 'Internal server error',
          message: 'An error occurred while processing the request'
        });
      });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  });

  return app;
};

// Start server if this file is run directly
if (require.main === module) {
  KiltDidResolver.getInstance().then(kiltResolver => {
    const resolver = new DidResolver(kiltResolver, config.cache.ttlSeconds);
    const app = createApp(resolver);
    
    const server = app.listen(config.port, () => {
      console.log(`DID resolver running on port ${config.port}`);
      console.log(`Cache TTL: ${config.cache.ttlSeconds} seconds`);
      console.log(`Rate limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs}ms`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        resolver.disconnect().then(() => {
          console.log('Resources cleaned up');
          process.exit(0);
        });
      });
    });
  });
}

export { KiltDidResolver, DidResolver };
