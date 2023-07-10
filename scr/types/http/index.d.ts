import { user } from 'src/entities/user';

declare module 'http' {
  interface IncomingMessage {
    currentUser?: user;
  }
}
