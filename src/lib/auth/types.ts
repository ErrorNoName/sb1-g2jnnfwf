export interface WhitelistedUser {
  username: string;
  password: string;
}

export interface WhitelistData {
  users: WhitelistedUser[];
}

export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'MALFORMED_DATA';
  message: string;
}