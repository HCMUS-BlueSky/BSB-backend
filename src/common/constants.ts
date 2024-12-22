export enum ROLES {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  GUEST = 'GUEST',
}

export enum TRANSACTION_STATUS {
  PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED',
}

export enum REMIND_STATUS {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export enum PAYER {
  SENDER = 'SENDER',
  RECEIVER = 'RECEIVER',
}

export enum RECEIVER_TYPE {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum ACCOUNT_TYPE {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum TRANSACTION_TYPE {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export enum FEE {
  PERCENTAGE = 0.01,
  MAX = 100000,
}

export const OTP_EXPIRED_TIME = 3 * 60 * 60 * 1000; // 3 hours
