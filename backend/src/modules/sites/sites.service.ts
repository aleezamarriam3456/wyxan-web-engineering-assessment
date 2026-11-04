
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  extractPageText,
  sanitizePage,
} from '../../common/security/page-content';
import { Site } from './site.schema';

interface CreateSiteData {
  address: string;
  title: string;
  html: string;
  author: string;
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,
  ) {}

  /**
   * Normalizes website addresses.
   * Example: "Tidepool" becomes "tidepool.zz".
   */
  private normalizeAddress(address: string): string {
    const normalized = address.trim().toLowerCase();

    return normalized.endsWith('.zz')
      ? normalized
      : `${normalized}.zz`;
  }

  /**
   * Finds a website using its normalized address.
   */
  async findByAddress(address: string) {
    const normalizedAddress = this.normalizeAddress(address);

    const site = await this.siteModel
      .findOne({ address: normalizedAddress })
      .lean()
      .exec();

    if (!site) {
      throw new NotFoundException(
        'This website does not exist.',
      );
    }

    return site;
  }

  /**
   * Sanitizes and saves a new website.
   */
  async create(data: CreateSiteData) {
    const address = this.normalizeAddress(data.address);
    const title = data.title.trim();
    const author = data.author.trim();

    const html = sanitizePage(data.html);
    const text = extractPageText(html);

    try {
      return await this.siteModel.create({
        address,
        title,
        html,
        text,
        author,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException(
          'A website with this address already exists.',
        );
      }

      throw error;
    }
  }
}
