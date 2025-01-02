import { createParamDecorator, ExecutionContext } from '@nestjs/common';
const FromBank = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.bank;
  },
);

export { FromBank };
