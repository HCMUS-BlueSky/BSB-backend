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
        userIDs: [{ name: 'BlueSkyBank', email: 'external@blueskybank.com' }],
      })
      .then((key) => {
        this.privateKey = key.privateKey;
        this.publicKey = key.publicKey;
      });
  }

  async encrypt(data: string) {
    const publicKey = await openpgp.readKey({ armoredKey: this.publicKey });
    const encrypted = await openpgp.encrypt({
      message: await openpgp.createMessage({ text: data }),
      encryptionKeys: publicKey,
    });
    return encrypted;
  }

  getPublicKey() {
    return this.publicKey;
  }

  async decrypt(data: string) {
    const privateKey = await openpgp.readPrivateKey({
      armoredKey: this.privateKey,
    });
    const { data: decrypted } = await openpgp.decrypt({
      message: await openpgp.readMessage({ armoredMessage: data }),
      decryptionKeys: privateKey,
    });
    return decrypted;
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
