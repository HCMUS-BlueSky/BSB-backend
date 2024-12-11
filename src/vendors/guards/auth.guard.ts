import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
// import { UnauthorizedException } from '../exceptions/errors.exception';
import { ErrorMessage } from '../../common/messages';
import { ROLES } from '../../common/constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isForceLogin = this.reflector.get<boolean>(
      'isForceLogin',
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();
    try {
      const { authorization }: any = request.headers;
      if (!authorization || authorization.trim() === '') {
        if (isForceLogin) {
          throw new UnauthorizedException(ErrorMessage.EMPTY_TOKEN);
        }
        request.user = {
          role: ROLES.GUEST,
        };
        return request;
      }
      const authToken = authorization?.split(' ')[1];
      const resp: any = await this.authService.validateToken(authToken);
      request.user = resp;
      return request;
    } catch {
      if (!isForceLogin) {
        request.user = {
          role: ROLES.GUEST,
        };
        return request;
      }
      throw new UnauthorizedException();
    }
  }
}
