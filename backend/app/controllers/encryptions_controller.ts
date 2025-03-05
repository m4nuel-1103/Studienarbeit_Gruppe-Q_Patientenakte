import type { HttpContext } from '@adonisjs/core/http';
import { encrypt } from '@metamask/eth-sig-util';
// import * as LitJsSdk from "@lit-protocol/lit-node-client";
// import { LIT_NETWORK } from "@lit-protocol/constants";
// import { encryptString } from '@lit-protocol/encryption';

export default class EncryptionsController {
  public async encrypt(ctx: HttpContext) {
    const body = ctx.request.body();
    console.log(body);
    const pKey: string = body.pKey;
    const message: string = body["message"];
    const encryptedData = encrypt({
      data: message,
      publicKey: pKey,
      version: "x25519-xsalsa20-poly1305",
    });
    ctx.response.json(encryptedData);
  }
}
