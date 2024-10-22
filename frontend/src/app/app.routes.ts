import { Routes } from '@angular/router';
import { EnterComponent } from './views/enter/enter.component';
import { RoomComponent } from './views/room/room.component';
import { CreateRoomComponent } from './views/room/create/create.component';
import { RoomsComponent } from './views/room/list/rooms.component';
import { AuthGuard } from './guards/auth.guard';
import { CheckAuthComponent } from './views/auth/check.component';


export const routes: Routes = [
	{
		path: '',
		component: EnterComponent,
	},
	{
		path: 'chechAuth',
		component: CheckAuthComponent,
	},
	{
		path: 'room',
		canActivate: [AuthGuard],
		children:[
			{
				path: 'list',
				component: RoomsComponent,
			},
			{
				path: 'create',
				component: CreateRoomComponent,
			},
			{
				path: 'join/:room',
				component: RoomComponent,
			}
		]
	},
	{ path: '**', redirectTo: '/' } 
	
];
