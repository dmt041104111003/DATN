import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';

@Controller('location')
export class LocationController {
  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): Promise<any> {
    const cleanLat = String(lat ?? '').trim();
    const cleanLng = String(lng ?? '').trim();

    if (!cleanLat || !cleanLng) {
      throw new BadRequestException('Thiếu tham số lat hoặc lng.');
    }

    const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;
    if (!geoapifyApiKey) {
      throw new InternalServerErrorException(
        'Thiếu cấu hình GEOAPIFY_API_KEY trên server.',
      );
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(
      cleanLat,
    )}&lon=${encodeURIComponent(cleanLng)}&lang=vi&apiKey=${encodeURIComponent(
      geoapifyApiKey,
    )}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      throw new BadGatewayException(
        'Không truy vấn được Geoapify reverse geocoding.',
      );
    }
    return res.json();
  }
}
