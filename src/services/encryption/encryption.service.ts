import { Injectable } from '@nestjs/common';
import * as openpgp from 'openpgp';
import crypto from 'crypto';

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

  async sign(data: string) {
    const privateKey = await openpgp.readPrivateKey({
      armoredKey: this.privateKey,
    });
    const signed = await openpgp.sign({
      message: await openpgp.createMessage({ text: data }),
      signingKeys: privateKey,
    });
    return signed;
  }

  async verify(data: string) {
    const publicKey = await openpgp.readKey({ armoredKey: this.publicKey });
    const verificationResult = await openpgp.verify({
      message: await openpgp.readMessage({ armoredMessage: data }),
      verificationKeys: publicKey,
    });
    const { verified, keyID } = verificationResult.signatures[0];
    try {
      await verified; // throws on invalid signature
      return true;
      console.log('Signed by key id ' + keyID.toHex());
    } catch {
      return false;
    }
  }

  async RSAverify(data: string, signature: string, publicKey: string) {
    try {
      const verify = crypto.createVerify('RSA-SHA256');

      verify.update(data);
      verify.end();
      return verify.verify(publicKey, signature);
    } catch (error) {
      console.log(error);
      return false;
    }
    // const isVerified = crypto.verify(
    //   'sha256',
    //   Buffer.from(data),
    //   {
    //     key: publicKey,
    //     padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    //   },
    //   Buffer.from(signature),
    // );
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
