import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  constructor(private readonly configService: ConfigService) {
    const name = this.configService.get<string>('CLOUDINARY_NAME');
    const key = this.configService.get<string>('CLOUDINARY_KEY');
    const secret = this.configService.get<string>('CLOUDINARY_SECRET');
    if (name && key && secret) {
      cloudinary.config({
        cloud_name: name,
        api_key: key,
        api_secret: secret,
      });
      this.configured = true;
    }
  }

  /**
   * Upload image buffer to Cloudinary. Returns secure URL for use in site.json.
   * Folder is set to nail-salons/{salonId} for organization per salon.
   */
  async uploadImage(buffer: Buffer, salonId: string): Promise<{ url: string }> {
    if (!this.configured) {
      throw new InternalServerErrorException(
        'Cloudinary is not configured. Set CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET.',
      );
    }

    const folder = `nail-salons/${this.sanitizeFolderSegment(salonId)}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) {
            this.logger.error(`Cloudinary upload failed: ${err.message}`);
            reject(
              new InternalServerErrorException(
                err.message || 'Image upload failed',
              ),
            );
            return;
          }
          if (!result?.secure_url) {
            reject(
              new InternalServerErrorException('No URL returned from Cloudinary'),
            );
            return;
          }
          resolve({ url: result.secure_url });
        },
      );
      uploadStream.end(buffer);
    });
  }

  private sanitizeFolderSegment(salonId: string): string {
    return salonId.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
}
