
import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { SearchService } from './search.service';

@Controller('api/search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  async search(@Query('q') query: string) {
    if (!query || !query.trim()) {
      throw new BadRequestException(
        'Search query is required.',
      );
    }

    return this.searchService.search(query);
  }
}
