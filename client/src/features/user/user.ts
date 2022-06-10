import { Lead } from '../lead/lead';
import { Arrow } from '../arrow/arrow';
import { Role } from '../role/role';

export type User = {
  id: string;
  roles: Role[];
  leaders: Lead[];
  followers: Lead[];
  frameId: string | null;
  frame: Arrow | null;
  focusId: string | null;
  focus: Arrow | null;
  email: string;
  name: string;
  lowercaseName: string;
  routeName: string;
  description: string;
  color: string;
  lng: number | null;
  lat: number | null;
  mapLng: number | null;
  mapLat: number | null;
  mapZoom: number | null;
  verifyEmailDate: Date | null;
  isRegisteredWithGoogle: boolean;
  activeDate: Date;
  createDate: Date;
  updateDate: Date;
  deleteDate: Date | null;
  __typename: string;
};

export type IdToTrueType = {
  [id: string]: true;
};
