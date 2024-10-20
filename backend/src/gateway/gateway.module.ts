import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoomModule } from '@app/room/room.module';
import { UserModule } from '@app/user/user.module';

@Module({
  imports:[RoomModule, UserModule],
  providers:[EventsGateway]
})
export class GatewayModule {}
