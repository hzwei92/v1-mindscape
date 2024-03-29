import e from "express";

export const DEV_SERVER_URI = 'http://localhost:9000';
export const DEV_WS_SERVER_URI = 'ws://localhost:9000';

export const EMAIL_REGEX = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

export const GOOGLE_CLIENT_ID = '453561312616-3go403qbepjm03b5g95h15tpcag6fvb0.apps.googleusercontent.com';

export const REFRESH_ACCESS_TOKEN_TIME = 8 * 60 * 1000;

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFtbnRjZyIsImEiOiJja3ZqMGk0bmRiZms0MnB0OXNpb2NneGo0In0.nDqGANM1cIwpqVLBl506Vw';

export const DEFAULT_COLOR = '#9575cd';

export const ALGOLIA_APP_ID = 'HOAE3WPXYN';
export const ALGOLIA_APP_KEY = '19ba9cfd0f40e1d1abf77d51c472c4e3';
export const ALGOLIA_INDEX_NAME = process.env.NODE_ENV === 'production'
  ? 'prod_mindscape'
  : 'dev_mindscape';

export const MOBILE_WIDTH = 420;

export const LOAD_LIMIT = 20;


export const IFRAMELY_API_KEY ='bc4275a2a8daa296c09f9243cf940f0a'

export const MAX_Z_INDEX = 2000000000;

export const TWIG_WIDTH = 500;

export const MENU_WIDTH = 500;
export const MENU_MIN_WIDTH = 400;

export const FRAME_WIDTH = 500;
export const FRAME_MIN_WIDTH = 400;

export const START_POST_I = 1;

export const SPACE_BAR_HEIGHT = 50;

export const VIEW_RADIUS = 30000;

export const NOT_FOUND = 'NOT_FOUND';

export const CLOSED_LINK_TWIG_DIAMETER = 40;

export const ROLES_MENU_WIDTH = 300;

export const APP_BAR_HEIGHT = 48;