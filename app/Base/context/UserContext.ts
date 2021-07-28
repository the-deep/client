import { createContext } from 'react';

import { User } from '#base/types/user';

export interface UserContextInterface {
    user: User | undefined;
    setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
    authenticated: boolean,

    ready: boolean;
    setReady: React.Dispatch<React.SetStateAction<boolean>>;
    errored: boolean;
    setErrored: React.Dispatch<React.SetStateAction<boolean>>;

    navbarState: boolean;
    setNavbarState: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextInterface>({
    authenticated: false,
    user: undefined,
    setUser: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setUser called on UserContext without a provider', value);
    },
    errored: false,
    setErrored: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setErrored called on UserContext without a provider', value);
    },
    ready: false,
    setReady: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setReady called on UserContext without a provider', value);
    },

    // TODO: move this to different producer
    navbarState: false,
    setNavbarState: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setNavbarState called on UserContext without a provider', value);
    },
});

export default UserContext;
