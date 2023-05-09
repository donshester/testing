import { Request } from 'express';
import { UserResponseInterface } from './user-response.interface';

export interface ExpressRequestWithUser extends Request {
  user?: Omit<UserResponseInterface, 'token'>;
}
