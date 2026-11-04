
import sanitizeHtml from 'sanitize-html';

export function sanitizePage(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'b',
      'strong',
      'i',
      'em',
      'blockquote',
      'pre',
      'code',
      'br',
      'hr',
      'div',
      'span',
      'section',
      'article',
      'header',
      'footer',
      'nav',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ],

    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'data-address'],
    },

    allowedStyles: {
      '*': {
        color: [
          /^#[0-9a-f]{3,8}$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,
          /^[a-z]+$/i,
        ],
        'background-color': [
          /^#[0-9a-f]{3,8}$/i,
          /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i,
          /^[a-z]+$/i,
        ],
        'font-size': [/^\d+(?:px|em|rem|%)$/i],
        'text-align': [/^(left|right|center|justify)$/i],
        margin: [/^\d+(?:px|em|rem|%)$/i],
        padding: [/^\d+(?:px|em|rem|%)$/i],
        border: [/^[\w\s#(),.-]+$/i],
      },
    },

    allowedSchemes: ['http', 'https'],

    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href?.trim() ?? '';

        const internalAddress = href.match(
          /^(?:https?:\/\/)?([a-z0-9-]+\.zz)\/?$/i,
        );

        const attributes: Record<string, string> = {};

        if (internalAddress) {
          attributes['data-address'] =
            internalAddress[1].toLowerCase();
        }

        return {
          tagName: 'a',
          attribs: attributes,
        };
      },
    },
  });
}

export function extractPageText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();
}
