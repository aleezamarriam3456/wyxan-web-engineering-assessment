
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { CreateSiteDto } from './dto/create-site.dto';
import { SitesService } from './sites.service';

@Controller('api/sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
  ) {}

  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  @Get(':address')
  async findByAddress(
    @Param('address') address: string,
  ) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  async create(
    @Body() createSiteDto: CreateSiteDto,
  ) {
    return this.sitesService.create(createSiteDto);
  }
}
