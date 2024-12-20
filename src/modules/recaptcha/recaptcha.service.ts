import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaService {
  private readonly secretKey = process.env.RECAPTCHA_SECRET_KEY;

  constructor(private readonly httpService: HttpService) {}

  async validateRecaptcha(token: string): Promise<boolean> {
    const url = `https://www.google.com/recaptcha/api/siteverify`;
    const params = {
      secret: this.secretKey,
      response: token,
    };

    console.log(params);

    try {
      const { data } = await lastValueFrom(
        this.httpService.post(url, null, { params }),
      );

      if (!data.success) {
        throw new HttpException(
          'reCAPTCHA verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      return true;
    } catch (err) {
      throw new HttpException(
        'reCAPTCHA validation error with Error: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
