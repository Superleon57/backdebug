import { user } from 'src/entities/user';
import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      shopId?: string;
      currentUser?: user;
      token: DecodedIdToken;
    }
  }
}
