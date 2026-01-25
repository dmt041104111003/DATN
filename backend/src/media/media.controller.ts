import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { CurrentUser } from '../auth/decorators';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.mediaService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.mediaService.findOne(id, user.id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'video/mp4',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadFile(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.mediaService.uploadToIpfs(user.id, file);
  }

  @Post('upload/batch')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'video/mp4',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadFiles(
    @CurrentUser() user: { id: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.mediaService.uploadBatchToIpfs(user.id, files);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
  ) {
    return this.mediaService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.mediaService.remove(id, user.id);
  }
}
