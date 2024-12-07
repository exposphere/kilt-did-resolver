import express, { RequestHandler } from 'express';
import { KiltDidResolver, ResolutionError, ServerError } from './services/KiltDidResolver';
import { DidResolver } from './services/DidResolver';
import { config } from './config';

export const createApp = (resolver: DidResolver) => {
  const app = express();
  app.use(express.json());

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

  return app;
};

if (require.main === module) {
  KiltDidResolver.getInstance().then(kiltResolver => {
    const resolver = new DidResolver(kiltResolver);
    const app = createApp(resolver);
    app.listen(config.port, () => {
      console.log(`DID resolver running on port ${config.port}`);
    });
  });
}

export { KiltDidResolver, DidResolver };