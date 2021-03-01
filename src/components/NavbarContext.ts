import React from 'react';
import { NavbarContextProps } from '#typings';

const domainContext = React.createContext<NavbarContextProps>({
    parentNode: null,
    setParentNode: (node: HTMLDivElement | undefined | null) => {
        console.warn('Trying to set parent node', node);
    },
});

export default domainContext;

