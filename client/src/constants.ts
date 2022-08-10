export const DEV_SERVER_URI = 'http://localhost:9000';
export const DEV_WS_SERVER_URI = 'ws://localhost:9000';

export const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

export const GOOGLE_CLIENT_ID = '320721321078-iu61jffh7000m848qjha76o0qdrl6h7o.apps.googleusercontent.com';

export const REFRESH_ACCESS_TOKEN_TIME = 8 *60 * 1000;

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFtbnRjZyIsImEiOiJja3ZqMGk0bmRiZms0MnB0OXNpb2NneGo0In0.nDqGANM1cIwpqVLBl506Vw';

export const DEFAULT_COLOR = '#9575cd';

export const ALGOLIA_APP_ID = 'HOAE3WPXYN';
export const ALGOLIA_APP_KEY = '19ba9cfd0f40e1d1abf77d51c472c4e3';
export const ALGOLIA_INDEX_NAME = process.env.NODE_ENV === 'production'
  ? 'prod_mindscape'
  : 'dev_mindscape';

export const MOBILE_WIDTH = 420;

export const LOAD_LIMIT = 20;


export const IFRAMELY_API_KEY ='7ddcf037df1408738a31dbe056575ba1'
export const IFRAMELY_API_KEY_DARK='94bfef11d502890ea3be39545c43c2f9';
export const IFRAMELY_API_KEY_LIGHT='ccc8c698f47cd34726d1dde82d931c1f';

export const MAX_Z_INDEX = 2000000000;

export const TWIG_WIDTH = 400;

export const MENU_WIDTH = 450;
export const MENU_MIN_WIDTH = 400;

export const FOCUS_WIDTH = 500;
export const FOCUS_MIN_WIDTH = 300;

export const START_POST_I = 1;

export const SPACE_BAR_HEIGHT = 50;

export const VIEW_RADIUS = 30000;

export const NOT_FOUND = 'NOT_FOUND';

export enum DisplayMode {
  SCATTERED = 'SCATTERED',
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
};
