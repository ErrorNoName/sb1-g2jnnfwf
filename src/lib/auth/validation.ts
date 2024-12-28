import { WhitelistedUser } from './types';

export function validateCredentials(
  username: string, 
  password: string, 
  whitelistedUser: WhitelistedUser | undefined
): boolean {
  if (!whitelistedUser) {
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  return (
    timingSafeEqual(username, whitelistedUser.username) && 
    timingSafeEqual(password, whitelistedUser.password)
  );
}

// Simple timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}