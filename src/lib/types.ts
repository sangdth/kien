export type Anchor = {
  x: number;
  y: number;
} | number | [number, number];

export type Count = {
  title: string;
  value: number;
};

export type Point = {
  x: number;
  y: number;
};

export type SignalPoint = Point & {
  id: string;
};

export type MatterBodiesArgs = Point & {
  height?: number;
  maxSides?: number;
  radius?: number;
  sides?: number;
  slope?: number;
  width?: number;
  options?: any; // FIXME
};

export type PositionState = Point & {
  rotation: number;
};

export type PositionAction = {
  type: 'update' | 'reset';
  payload: Partial<PositionState>;
};

export type Distance = {
  x: number; // should be dx
  y: number; // should be dy
  value: number;
};

export type BaseUnitProps = {
  id: string;
  position: Partial<PositionState>;
  anchor?: Anchor;
  shape?: 'circle' | 'rectangle' | 'poligon' | 'trapezoid' | 'fromVertices';
  radius?: number;
  height?: number;
  width?: number;
  options?: any; // options for the matter-js mostly
};
