// src/middlewares/accountLockMiddleware.ts
import { Request, Response, NextFunction } from 'express';
// import { isLocked } from '../services/accountLockService';
// import { sendErrorResponse } from '../utils/responseUtils';

// const accountLockMiddleware = (lockType: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const { username } = req.body;
//     const user = await User.findOne({ username });

//     if (!user) {
//       return sendErrorResponse(res, 401, 'Invalid credentials');
//     }

//     const userId = user.id;

//     if (await isLocked(userId, lockType)) {
//       return sendErrorResponse(res, 423, `Account is locked due to too many failed attempts. Please try again later.`);
//     }

//     next();
//   };
// };

// export default accountLockMiddleware;
