
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@Controller('api/visits')
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
  ) {}

  @Post()
  async create(@Body() body: CreateVisitDto) {
    return this.visitsService.create(body);
  }

  @Get()
  async findByPerson(
    @Query('person') person: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : 200;

    return this.visitsService.findByPerson(
      person,
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 200)
        : 200,
    );
  }
}
