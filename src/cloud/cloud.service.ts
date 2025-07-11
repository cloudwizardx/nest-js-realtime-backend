/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_NAME'),
      api_key: config.get<string>('CLOUDINARY_KEY'),
      api_secret: config.get<string>('CLOUDINARY_SECRET'),
    });
  }

  async uploadFile(
    file: string | Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    try {
      if (typeof file === 'string') {
        return await cloudinary.uploader.upload(file, {
          folder,
          resource_type: 'auto',
        });
      } else {
        return await new Promise<UploadApiResponse>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result as UploadApiResponse);
              }
            }
          );
          uploadStream.end(file);
        });
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
      throw error;
    }
  }
}
