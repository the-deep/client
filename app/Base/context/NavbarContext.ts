import { createContext } from 'react';

interface NavbarState {
    path: string;
    visibility: boolean;
}

export interface NavbarContextInterface {
    navbarState: NavbarState[];
    setNavbarState: React.Dispatch<React.SetStateAction<NavbarState[]>>;
}

export const NavbarContext = createContext<NavbarContextInterface>({
    navbarState: [],
    setNavbarState: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setNavbarVisibility called on NavbarContext without a provider', value);
    },
});

export default NavbarContext;
