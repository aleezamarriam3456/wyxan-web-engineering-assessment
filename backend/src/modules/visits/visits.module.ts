
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Visit, VisitSchema } from './visit.schema';
import { Person, PersonSchema } from '../people/person.schema';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Visit.name,
        schema: VisitSchema,
      },
      {
        name: Person.name,
        schema: PersonSchema,
      },
    ]),
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService],
})
export class VisitsModule {}
