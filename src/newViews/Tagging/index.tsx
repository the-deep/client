import React from 'react';
import {
    Redirect,
} from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import { pathNames } from '#constants';

function Tagging() {
    const sourcesRoute = reverseRoute(pathNames.sources, {});
    return (
        <Redirect
            to={sourcesRoute}
            exact
        />
    );
}
export default Tagging;
