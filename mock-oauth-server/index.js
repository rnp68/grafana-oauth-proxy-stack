import express from 'express';
import { Provider } from 'oidc-provider';
import debug from 'debug';

const app = express();
const debugLog = debug('mock-oauth-server');

// Enable debug logging
debugLog.enabled = true;

const configuration = {
  clients: [
    {
      client_id: 'test-client',
      client_secret: 'super-secret',
      grant_types: ['client_credentials'],
      response_types: [],
      token_endpoint_auth_method: 'client_secret_basic',
      scope: 'openid profile email'
    }
  ],
  features: {
    devInteractions: { enabled: false },
    clientCredentials: { enabled: true }
  },
  scopes: ['openid', 'profile', 'email'],
  cookies: {
    keys: ['some-secret-key-for-cookies']
  },
  jwks: {
    keys: [
      {
        kty: 'RSA',
        e: 'AQAB',
        n: 'some-base64-encoded-modulus',
        d: 'some-base64-encoded-private-exponent',
        p: 'some-base64-encoded-prime1',
        q: 'some-base64-encoded-prime2',
        dp: 'some-base64-encoded-exponent1',
        dq: 'some-base64-encoded-exponent2',
        qi: 'some-base64-encoded-coefficient'
      }
    ]
  },
  async findAccount(ctx, sub) {
    return {
      accountId: sub,
      async claims() {
        return { sub };
      }
    };
  }
};

try {
  const oidc = new Provider('http://localhost:3000', configuration);
  
  // Add error handling for the server
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });
  
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });
  
  oidc.listen(3000, () => {
    console.log('🚀 Mock OAuth 2.0 Server running on http://localhost:3000');
  });
} catch (err) {
  console.error('Failed to start OAuth server:', err);
  process.exit(1);
}
