import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { UserCreateDto } from './dto/userCreate.dto';
import { IUserAuthResponse } from './types/userAuthResponse.inteface';
import { verify } from 'jsonwebtoken';

@Injectable()
export class UserService {
	public buildUserResponse(user: UserCreateDto): IUserAuthResponse {
		return {
			id: user.id,
			token: this.generateJwt(user),
			name: user.name
		}
	}
	public verifyJwt(token: string): UserCreateDto | null {
		try {
		 	return verify(token, process.env.JWT_SECRET);
		} catch (error) {
			
		}		
		return null;
	}

	private generateJwt(user: UserCreateDto): string {
		return sign({
			id: user.id,
			name: user.name
		}, process.env.JWT_SECRET);
	}
}
