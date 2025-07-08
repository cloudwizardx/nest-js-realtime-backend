import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface WsClient {
  data: {
    user: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<WsClient>();
    return client.data.user;
  }
);
