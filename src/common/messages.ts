export enum ErrorMessage {
  EXPIRED_TOKEN = 'Token expired',
  INVALID_TOKEN = 'Invalid token',
  EMPTY_TOKEN = 'Empty token',
  NOT_BEFORE = 'Current time is before the nbf claim',
  USER_EXISTED = 'This email has already been registered',
  INVALID_USER = "This user doesn't exist",
  WRONG_PASSWORD = 'Incorrect password',
  ACCOUNT_NOT_EXIST = "This account number doesn\'t exist",
  NOT_IMPLEMENTED = 'Not implemented',
  RECEIVER_IS_SAME = 'Receiver is same as user',
  RECEIVER_EXISTED = 'Receiver is already in list',
  RECEIVER_NOT_EXISTED = 'Receiver not exist',
  INSUFFICIENT_BALANCE = 'Insufficient balance',
  ACCOUNT_IS_DISABLED = 'Account is disabled',
  RECEIVER_IS_DISABLED = 'Receiver is disabled',
  ON_GOING_TRANSACTION = 'There is an on-going transaction',
  INVALID_OTP = 'Invalid OTP',
  OTP_EXPIRED = 'OTP expired',
  INVALID_TRANSACTION = 'Invalid transaction',
  INVALID_USER_REMIND = 'Invalid user remind',
}

export enum GenericErrorMessage {
  UNAUTHORIZED = 'Unauthorized',
  NOT_FOUND = 'Not Found',
  BAD_REQUEST = 'Bad Request',
  FORBIDDEN = 'Forbidden',
  CONFLICT = 'Conflict',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}

export enum GenericErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export enum JsonWebTokenError {
  EXPIRED_TOKEN = 'TokenExpiredError',
  INVALID_TOKEN = 'JsonWebTokenError',
  NOT_BEFORE = 'NotBeforeError',
}

export enum SuccessMessage {
  SUCCESS = 'Success',
}

export enum ErrorCode {
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOKEN_REQUIRED = 499,
  HEADER_FAILURE = 417,
}

export enum CustomErrorCode {
  PAGER_ERR_CODE = 701,
  DATA_NOT_FOUND = 702,
}
export enum SucceedCode {
  OK = 200,
}
