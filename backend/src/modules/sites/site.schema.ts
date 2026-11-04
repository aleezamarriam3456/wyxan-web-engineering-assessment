
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: false })
export class Site {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  address: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  title: string;

  @Prop({ required: true })
  html: string;

  @Prop({ required: true })
  text: string;

  @Prop({
    required: true,
    trim: true,
  })
  author: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SiteSchema = SchemaFactory.createForClass(Site);

SiteSchema.index(
  { title: 'text', text: 'text' },
  {
    weights: {
      title: 5,
      text: 1,
    },
    name: 'site_full_text_search',
  },
);
