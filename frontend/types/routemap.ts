export type PointType = 'origin' | 'receiver' | 'script' | 'outside';

export type ExtraPoint = {
  lat: number;
  lng: number;
  label?: string;
  pointType?: PointType;
};

export type RouteMapProps = {
  routeCoordinates: string;
  height?: number;
  labels?: string[];
  pointTypes?: PointType[];
  extraPoints?: ExtraPoint[];
};
