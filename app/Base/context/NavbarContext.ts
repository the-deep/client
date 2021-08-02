import { createContext } from 'react';

export interface NavbarContextInterface {
    navbarState: boolean;
    setNavbarState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NavbarContext = createContext<NavbarContextInterface>({
    navbarState: false,
    setNavbarState: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setNavbarState called on NavbarContext without a provider', value);
    },
});

export default NavbarContext;
