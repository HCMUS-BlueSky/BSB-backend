import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../../common/constants';

export const AdminRoles = (...roles: ROLES[]) => SetMetadata('roles', roles);
