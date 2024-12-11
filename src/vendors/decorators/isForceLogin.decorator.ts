import { SetMetadata } from '@nestjs/common';

export const IsForceLogin = (isForceLogin: boolean) =>
  SetMetadata('isForceLogin', isForceLogin);
