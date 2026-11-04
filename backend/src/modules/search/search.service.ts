
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Site } from '../sites/site.schema';

export interface SearchResult {
  address: string;
  title: string;
  snippets: {
    text: string;
    hit: boolean;
  }[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Site.name)
    private readonly siteModel: Model<Site>,
  ) {}

  /**
   * Searches website titles and full page content.
   */
  async search(query: string): Promise<SearchResult[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return [];
    }

    const sites = await this.siteModel
      .find(
        { $text: { $search: normalizedQuery } },
        {
          score: { $meta: 'textScore' },
          address: 1,
          title: 1,
          text: 1,
        },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean()
      .exec();

    return sites.map((site) => {
      const content = site.text ?? '';
      const lowerContent = content.toLowerCase();
      const lowerQuery = normalizedQuery.toLowerCase();
      const matchIndex = lowerContent.indexOf(lowerQuery);

      const start = matchIndex >= 0
        ? Math.max(0, matchIndex - 60)
        : 0;

      const snippetText = content.slice(start, start + 180);

      return {
        address: site.address,
        title: site.title,
        snippets: [
          {
            text: snippetText,
            hit: matchIndex >= 0,
          },
        ],
      };
    });
  }
}
