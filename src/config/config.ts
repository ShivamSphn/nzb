interface Config {
  server: {
    defaultAddress: string;
    defaultPort: number;
  };
  nntp: {
    hostname?: string;
    port?: number;
    ssl: boolean;
    username?: string;
    password?: string;
    connections: number;
    connectRetries: number;
    reconnectDelay: number;
    requestRetries: number;
    postRetryDelay: number;
  };
}

export const defaultConfig: Config = {
  server: {
    defaultAddress: '127.0.0.1',
    defaultPort: 8000
  },
  nntp: {
    ssl: false,
    connections: 1,
    connectRetries: 3,
    reconnectDelay: 1000,
    requestRetries: 3,
    postRetryDelay: 1000
  }
};

// Load environment variables
export const loadConfig = (): Config => {
  return {
    server: {
      defaultAddress: Bun.env.SERVER_ADDRESS || defaultConfig.server.defaultAddress,
      defaultPort: Number(Bun.env.SERVER_PORT) || defaultConfig.server.defaultPort
    },
    nntp: {
      hostname: Bun.env.NNTP_HOSTNAME,
      port: Number(Bun.env.NNTP_PORT),
      ssl: Bun.env.NNTP_SSL === 'true',
      username: Bun.env.NNTP_USERNAME,
      password: Bun.env.NNTP_PASSWORD,
      connections: Number(Bun.env.NNTP_CONNECTIONS) || defaultConfig.nntp.connections,
      connectRetries: Number(Bun.env.NNTP_CONNECT_RETRIES) || defaultConfig.nntp.connectRetries,
      reconnectDelay: Number(Bun.env.NNTP_RECONNECT_DELAY) || defaultConfig.nntp.reconnectDelay,
      requestRetries: Number(Bun.env.NNTP_REQUEST_RETRIES) || defaultConfig.nntp.requestRetries,
      postRetryDelay: Number(Bun.env.NNTP_POST_RETRY_DELAY) || defaultConfig.nntp.postRetryDelay
    }
  };
};

export const config = loadConfig();
