import React, { useContext, useEffect, useRef } from 'react';
import { ElementFragments } from '@the-deep/deep-ui';
import ReactDOM from 'react-dom';
import { _cs } from '@togglecorp/fujs';

import NavbarContext from './context';
import styles from './styles.css';

interface IconsProps {
    children: React.ReactNode;
}
export function Icons(props: IconsProps) {
    const {
        children,
    } = props;
    const {
        iconsNode,
    } = useContext(NavbarContext);
    if (!iconsNode) {
        return null;
    }
    return ReactDOM.createPortal(
        children,
        iconsNode,
    );
}

interface ActionsProps {
    children: React.ReactNode;
}
export function Actions(props: ActionsProps) {
    const {
        children,
    } = props;
    const {
        actionsNode,
    } = useContext(NavbarContext);
    if (!actionsNode) {
        return null;
    }
    return ReactDOM.createPortal(
        children,
        actionsNode,
    );
}

interface SubNavbarProps {
    className?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    icons?: React.ReactNode;
}
function SubNavbar(props: SubNavbarProps) {
    const {
        children,
        className,
        actions,
        icons,
    } = props;

    const { setActionsNode, setIconsNode } = useContext(NavbarContext);

    const actionsRef = useRef(null);
    const iconsRef = useRef(null);

    useEffect(
        () => {
            setActionsNode(actionsRef.current);
        },
        [setActionsNode],
    );
    useEffect(
        () => {
            setIconsNode(iconsRef.current);
        },
        [setIconsNode],
    );

    return (
        <nav className={_cs(className, styles.subNavbar)}>
            <ElementFragments
                iconsContainerClassName={styles.icons}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.children}
                icons={icons === undefined ? <div ref={iconsRef} /> : icons}
                actions={actions === undefined ? <div ref={actionsRef} /> : actions}
            >
                {children}
            </ElementFragments>
        </nav>
    );
}

export default SubNavbar;
