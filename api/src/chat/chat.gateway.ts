import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4200' },
  namespace: '/api/chat-socket',
  path: '/api/chat-socket/socket.io',
})
export class ChatGateway {
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('message recieved: ' + data);
    client.broadcast.emit('message', data);
    return 'Hello world!';
  }
}
