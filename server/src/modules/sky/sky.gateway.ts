import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { buildCorsOriginMatcher } from '../../common/utils/cors.util';
import type { SkyStar, SkyStarCreatedEvent } from '@5ss/contracts';

@WebSocketGateway({
  cors: {
    origin: buildCorsOriginMatcher(process.env.CLIENT_ORIGIN),
    credentials: true,
  },
})
export class SkyGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SkyGateway');

  afterInit(_server: Server) {
    this.logger.log('Websocket Gateway Initialized');
  }

  emitStarCreated(star: SkyStar): void {
    if (this.server) {
      const event: SkyStarCreatedEvent = { star };
      this.server.emit('star.created', event);
    }
  }
}
