import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { buildCorsOriginMatcher } from '../../common/utils/cors.util';
import type { SkyStar, SkyStarCreatedEvent } from '@5ss/contracts';

import { SkyService } from './sky.service';

@WebSocketGateway({
  cors: {
    origin: buildCorsOriginMatcher(process.env.CLIENT_ORIGIN),
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 20000,
})
export class SkyGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SkyGateway');

  constructor(private readonly skyService?: SkyService) {}

  afterInit(_server: Server) {
    this.logger.log('Websocket Gateway Initialized');
  }

  emitStarCreated(star: SkyStar): void {
    if (this.skyService) {
      this.skyService.invalidateCache();
    }
    if (this.server) {
      const event: SkyStarCreatedEvent = { star };
      this.server.emit('star.created', event);
    }
  }
}
