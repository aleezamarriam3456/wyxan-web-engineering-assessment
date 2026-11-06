
/*
 * File: page-content.ts
 *
 * Purpose:
 * Sanitizes website HTML before it is stored or displayed in MiniWeb.
 *
 * Responsibilities:
 * - Allow a controlled set of semantic HTML elements.
 * - Restrict inline CSS to approved properties and safe value patterns.
 * - Convert valid internal .zz links into MiniWeb navigation addresses.
 * - Remove scripts, embedded content, event handlers and external resources.
 * - Extract clean searchable text from sanitized website content.
 *
 * Security:
 * This sanitizer is one layer of protection. Website content must also
 * remain inside the sandboxed iframe with scripts disabled.
 */

import sanitizeHtml from 'sanitize-html';

/**
 * CSS values permitted for colours.
 * External URLs, CSS expressions and other resource-loading values
 * are deliberately excluded.
 */
const COLOR_VALUES = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i,
  /^[a-z]{3,20}$/i,
];

/**
 * CSS values permitted for dimensions.
 */
const DIMENSION_VALUES = [
  /^\d+(?:\.\d+)?(?:px|em|rem|%)$/i,
  /^0$/,
  /^auto$/i,
];

/**
 * Sanitizes a website's HTML before it is saved in MongoDB.
 */
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
      'small',
      'section',
      'article',
      'header',
      'main',
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
        color: COLOR_VALUES,
        'background-color': COLOR_VALUES,

        'font-size': DIMENSION_VALUES,
        'font-family': [/^[a-z0-9\s,"'-]+$/i],
        'font-weight': [/^(normal|bold|[1-9]00)$/i],
        'line-height': [/^(normal|\d+(?:\.\d+)?(?:px|em|rem|%)?)$/i],
        'letter-spacing': DIMENSION_VALUES,
        'text-align': [/^(left|right|center|justify)$/i],
        'text-decoration': [/^(none|underline|line-through)$/i],
        'text-transform': [/^(none|uppercase|lowercase|capitalize)$/i],

        display: [/^(block|inline|inline-block|flex|inline-flex|grid|none)$/i],
        'flex-direction': [/^(row|row-reverse|column|column-reverse)$/i],
        'align-items': [/^(start|end|center|stretch|flex-start|flex-end)$/i],
        'justify-content': [
          /^(start|end|center|space-between|space-around|space-evenly|flex-start|flex-end)$/i,
        ],
        'flex-wrap': [/^(nowrap|wrap|wrap-reverse)$/i],
        gap: DIMENSION_VALUES,

        width: DIMENSION_VALUES,
        'max-width': DIMENSION_VALUES,
        'min-width': DIMENSION_VALUES,
        height: DIMENSION_VALUES,
        'min-height': DIMENSION_VALUES,
        'max-height': DIMENSION_VALUES,

        margin: [/^(?:auto|0|\d+(?:\.\d+)?(?:px|em|rem|%))(?:\s+(?:auto|0|\d+(?:\.\d+)?(?:px|em|rem|%))){0,3}$/i],
        padding: [/^0$|^(?:\d+(?:\.\d+)?(?:px|em|rem|%))(?:\s+\d+(?:\.\d+)?(?:px|em|rem|%)){0,3}$/i],

        border: [
          /^(?:0|\d+(?:\.\d+)?px\s+(?:solid|dashed|dotted)\s+(?:#[0-9a-f]{3,8}|[a-z]+))$/i,
        ],
        'border-bottom': [
          /^(?:0|\d+(?:\.\d+)?px\s+(?:solid|dashed|dotted)\s+(?:#[0-9a-f]{3,8}|[a-z]+))$/i,
        ],
        'border-radius': DIMENSION_VALUES,
        opacity: [/^(0|1|0?\.\d+)$/],
      },
    },

    /**
     * Only internal MiniWeb addresses are converted into navigable links.
     * External URLs and unsupported paths lose their href.
     */
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

    allowedSchemes: [],
  });
}

/**
 * Extracts plain text for MongoDB full-text search.
 *
 * HTML markup and non-text content are excluded.
 */
export function extractPageText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
    nonTextTags: ['script', 'style', 'textarea', 'option'],
  })
    .replace(/\s+/g, ' ')
    .trim();
}
