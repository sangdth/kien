import React, {
  useCallback,
  useReducer,
  useRef,
} from 'react';
import { Sprite, useTick } from '@inlet/react-pixi';
import { cloneDeep } from 'lodash';

import {
  angularLerp,
  getDistance,
  lerp,
  memo,
  merge,
  xy,
} from '../lib/helpers';
import { defaultOptions, initialPosition } from '../lib/constants';

import type {
  BaseUnitProps,
  Point,
  PositionAction,
  PositionState,
} from '../lib/types';

export type Props = BaseUnitProps & {
  fillStyle?: number[];
  lineStyle?: number[];
  skin?: string;
  speed?: number;
  moveTo?: Point;
  debug?: boolean;
};

const reducer = (s: PositionState, a: PositionAction): PositionState => {
  switch (a.type) {
    case 'update':
      return merge(s, a.payload);
    case 'reset':
      return initialPosition;
    default:
      return initialPosition;
  }
};

const Unit = (props: Props) => {
  const {
    anchor = 0.5,
    debug = import.meta.env.DEV,
    height = 10,
    id,
    width = 10,
    moveTo,
    radius = 10,
    speed = 6,
    shape = 'rectangle',
    skin = '/warning.png',
    options = {},
    position,
    lineStyle = [1, 0xff0000, 0.5],
    fillStyle = [0x00ff00, 0.1],
  } = props;

  const [localPosition, update] = useReducer(reducer, merge(initialPosition, position));

  // const finalOptions = merge(defaultOptions, options);

  // FIXME: make types here
  const body = useRef<any>();
  const graphics = useRef<any>();

  // Guess the next point to move, we will try to use this to find best direction
  const predict = useCallback(() => {
    const current = cloneDeep(body.current.position);
    const distance = getDistance(current, moveTo);

    if (distance === null) {
      return localPosition;
    }

    const direction = Math.atan2(distance.y, distance.x);

    let dx = speed * Math.cos(direction);
    let dy = speed * Math.sin(direction);

    if (distance.value < 50) {
      dx *= distance.value / 50;
      dy *= distance.value / 50;
    }

    if (distance.value >= 1) {
      return merge(current, {
        x: current.x + dx,
        y: current.y + dy,
        direction,
      });
    }

    return current;
  }, [localPosition, speed, moveTo]);

  useTick((delta = 0) => {
    const g = graphics.current;
    const b = body.current;

    if (debug) {
      g.clear();

      g.lineStyle(...lineStyle);
      g.beginFill(...fillStyle);

      g.moveTo(...xy(b.vertices[0]));

      for (let j = 1; j < b.vertices.length; j += 1) {
        g.lineTo(...xy(b.vertices[j]));
      }

      g.lineTo(...xy(b.vertices[0]));

      if (/Circle/.test(b.label)) {
        g.moveTo(b.position.x, b.position.y);
        g.lineTo(
          b.position.x + Math.cos(b.angle) * radius,
          b.position.y + Math.sin(b.angle) * radius,
        );
      }
    }

    if (!options.isStatic) {
      const next = predict();

      const microPosition = {
        x: lerp(b.position.x, next.x, delta),
        y: lerp(b.position.y, next.y, delta),
        direction: angularLerp(b.angle, next.direction, delta),
      };

      const step = merge(b.position, microPosition);

      // interpolate between the origin and next position
      update({
        type: 'update',
        payload: step,
      });
    }
  });

  return (
    <Sprite
      interactive
      image={skin}
      height={height}
      width={width}
      anchor={anchor}
      // mouseover={(e) => console.log(id, e)}
      {...localPosition}
    />
  );
};

export default memo(Unit);
