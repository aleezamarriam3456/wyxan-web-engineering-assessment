
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Person } from '../people/person.schema';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name)
    private readonly visitModel: Model<Visit>,

    @InjectModel(Person.name)
    private readonly personModel: Model<Person>,
  ) {}

  private normalizeAddress(address: string): string {
    const normalized = address.trim().toLowerCase();

    return normalized.endsWith('.zz')
      ? normalized
      : `${normalized}.zz`;
  }

  async create(data: CreateVisitDto) {
    const person = data.person.trim();
    const address = this.normalizeAddress(data.address);

    const existingPerson = await this.personModel
      .findOne({ name: person })
      .lean()
      .exec();

    if (!existingPerson) {
      throw new NotFoundException(
        'This person does not exist.',
      );
    }

    return this.visitModel.create({
      person,
      address,
      via: data.via,
      found: data.found,
      at: new Date(),
      seeded: false,
    });
  }

  async findByPerson(person: string, limit = 200) {
    const normalizedPerson = person.trim();

    const existingPerson = await this.personModel
      .findOne({ name: normalizedPerson })
      .lean()
      .exec();

    if (!existingPerson) {
      throw new NotFoundException(
        'This person does not exist.',
      );
    }

    return this.visitModel
      .find({ person: normalizedPerson })
      .sort({ at: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}
