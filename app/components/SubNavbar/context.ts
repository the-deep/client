import { createContext } from 'react';

interface NavbarContextInterface {
    iconsNode?: Element | null | undefined;
    actionsNode?: Element | null | undefined;
    childrenNode?: Element | null | undefined;

    setIconsNode?: React.Dispatch<React.SetStateAction<Element | null | undefined>>;
    setActionsNode?: React.Dispatch<React.SetStateAction<Element | null | undefined>>;
    setChildrenNode?: React.Dispatch<React.SetStateAction<Element | null | undefined>>;
}

const NavbarContext = createContext<NavbarContextInterface>({
    iconsNode: null,
    setIconsNode: (node: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set icons node', node);
    },
    actionsNode: null,
    setActionsNode: (node: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set actions node', node);
    },
    childrenNode: null,
    setChildrenNode: (node: unknown) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set children node', node);
    },
});

export default NavbarContext;
