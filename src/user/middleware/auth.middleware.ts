import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import { ExpressRequestWithUser } from '../interface/request-with-user.interface';
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Authorization header not found' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Token not found in authorization header' });
    }

    try {
      const decoded: JwtPayload = verify(
        token,
        process.env.SECRET_KEY,
      ) as JwtPayload;
      const user = await this.userService.getUserByEmail(decoded.email);
      delete user.pdf;
      delete user.hashedPassword;
      delete user.image;
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
