export const PRIVATE_ARROW_DRAFT = JSON.stringify({
  blocks: [
    {
      key: 'privatePost',
      text: '<private>',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    }
  ],
  entityMap: {},
});

export const PRIVATE_ARROW_TEXT = '<private>';

export const REMOVED_ARROW_DRAFT = JSON.stringify({
  blocks: [
    {
      key: 'removedPost',
      text: '<deleted>',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    }
  ],
  entityMap: {},
});

export const REMOVED_ARROW_TEXT = '<deleted>';


export const START_ARROW_I = 1;

export const uuidRegexExp = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const LOAD_LIMIT = 20;

export const ACTIVE_TIME = 60 * 1000;
export const IDLE_TIME = 2 * 60 * 1000;


export const VIEW_RADIUS = 30000;