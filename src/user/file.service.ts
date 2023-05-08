import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Express } from 'express';
import { readFile } from 'fs/promises';

@Injectable()
export class FileService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  async uploadImage(imageFile: Express.Multer.File): Promise<string> {
    const buffer = await readFile(imageFile.path);
    const filename = `${Date.now()}-${imageFile.originalname}`;
    const bucket = admin.storage().bucket();

    const file = bucket.file(`user-images/${filename}`);
    await file.setMetadata({
      metadata: { firebaseStorageDownloadTokens: null },
    });
    await file.save(buffer, { contentType: imageFile.mimetype });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(file.name)}?alt=media`;
    await file.makePublic();

    return publicUrl;
  }

  // async generatePdf(user: UserEntity): Promise<Buffer>{
  //
  // }
  // async savePdfToUser(user: UserEntity, pdfFile: Buffer): Promise<UserEntity>{}
}
