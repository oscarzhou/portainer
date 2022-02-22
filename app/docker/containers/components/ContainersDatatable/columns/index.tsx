import _ from 'lodash';
import { useMemo } from 'react';

import { created } from './created';
import { host } from './host';
import { image } from './image';
import { ip } from './ip';
import { name } from './name';
import { ownership } from './ownership';
import { ports } from './ports';
import { quickActions } from './quick-actions';
import { stack } from './stack';
import { state } from './state';

export function useColumns(isHostColumnVisible: boolean) {
  return useMemo(
    () =>
      _.compact([
        name,
        state,
        quickActions,
        stack,
        image,
        created,
        ip,
        isHostColumnVisible && host,
        ports,
        ownership,
      ]),
    [isHostColumnVisible]
  );
}
