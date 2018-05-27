import React from 'react';
import RouteSynchronizer from '#components/RouteSynchronizer';
import { mapObjectToObject } from '#utils/common';
import { routes } from './routes';

const views = mapObjectToObject(
    routes,
    (route, name) => props => (
        <RouteSynchronizer
            {...props}
            load={route.loader}
            name={name}
        />
    ),
);
export default views;
