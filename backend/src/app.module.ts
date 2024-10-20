import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), RoomModule, UserModule, GatewayModule],
  controllers: [AppController],
  providers: [AppService, UserService, RoomService],
})
export class AppModule {}
