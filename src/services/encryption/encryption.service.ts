import { Injectable } from '@nestjs/common';
import * as openpgp from 'openpgp';

@Injectable()
export class EncryptionService {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    openpgp
      .generateKey({
        curve: 'brainpoolP512r1',
        userIDs: [{ name: 'Test', email: 'test@test.com' }],
      })
      .then((key) => {
        this.privateKey = key.privateKey;
        this.publicKey = key.publicKey;
      });
  }

  // async encrypt(data: string) {}

  getPublicKey() {
    return this.publicKey;
  }
  // async sendResetPwd(user: UserEntity, token: string) {
  //   const url = `${process.env.URL}/auth/reset-password?token=${token}`;

  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     // from: '"Support Team" <support@example.com>', // override default from
  //     subject: 'An toan so || Reset password',
  //     template: './reset-password', // `.hbs` extension is appended automatically
  //     context: { // ✏️ filling curly brackets with content
  //       name: user.name || user.email,
  //       url,
  //     },
  //   });
  // }
}
