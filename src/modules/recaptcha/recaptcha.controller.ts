import { Controller, Post } from '@nestjs/common';
import { RecaptchaService } from './recaptcha.service';
import {
  Recaptcha,
  RecaptchaResult,
  RecaptchaVerificationResult,
} from '@nestlab/google-recaptcha';

@Controller('recaptcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  @Post('validate')
  @Recaptcha()
  async validate(
    @RecaptchaResult() recaptchaResult: RecaptchaVerificationResult,
  ): Promise<any> {
    console.log(
      `Action: ${recaptchaResult.action} Score: ${recaptchaResult.score}`,
    );
    // TODO: Your implementation.
  }
}
