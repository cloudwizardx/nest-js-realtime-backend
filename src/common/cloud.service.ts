// import { v2 as cloudinary } from 'cloudinary';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// const configService = new ConfigService();

// cloudinary.config({
//   cloud_name: configService.get('CLOUDINARY_NAME'),
//   api_key:    configService.get('CLOUDINARY_KEY'),
//   api_secret: configService.get('CLOUDINARY_SECRET')
// });

// @Injectable()
// export class CloudService {
//   async uploadFile(file: string | Buffer, folder: string) {
//     return await cloudinary.uploader.upload(file, {
//       folder,
//       resource_type: 'auto'
//     });
//   }
// }
