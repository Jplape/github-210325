import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (ex) {
    next(new ApiError(400, 'Invalid token.'));
  }
}