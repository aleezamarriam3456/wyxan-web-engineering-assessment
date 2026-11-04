
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VisitDocument = HydratedDocument<Visit>;

export enum VisitSource {
  TYPED = 'typed',
  LINK = 'link',
  BACK = 'back',
  FORWARD = 'forward',
  HISTORY = 'history',
  SEARCH = 'search',
}

@Schema({ timestamps: false })
export class Visit {
  @Prop({
    required: true,
    trim: true,
  })
  person: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  address: string;

  @Prop({
    required: true,
    default: Date.now,
  })
  at: Date;

  @Prop({
    required: true,
    enum: VisitSource,
  })
  via: VisitSource;

  @Prop({
    required: true,
    default: true,
  })
  found: boolean;

  @Prop({
    default: false,
  })
  seeded: boolean;
}

export const VisitSchema = SchemaFactory.createForClass(Visit);
