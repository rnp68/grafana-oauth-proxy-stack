const { Provider } = require('oidc-provider');

const configuration = {
  clients: [
    {
      client_id: 'test-client',
      client_secret: 'super-secret',
      grant_types: ['client_credentials'],
      response_types: [],
      token_endpoint_auth_method: 'client_secret_basic',
    }
  ],
  features: {
    devInteractions: { enabled: false }
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

const oidc = new Provider('http://localhost:3000', configuration);

oidc.listen(3000, () => {
  console.log('🚀 Mock OAuth 2.0 Server running on http://localhost:3000');
});
