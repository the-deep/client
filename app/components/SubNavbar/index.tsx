import React, { useContext, useEffect, useRef } from 'react';
import { ElementFragments, Border } from '@the-deep/deep-ui';
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
}
function SubNavbar(props: SubNavbarProps) {
    const {
        children,
        className,
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
            <Border />
            <ElementFragments
                iconsContainerClassName={styles.icons}
                actionsContainerClassName={styles.actions}
                childrenContainerClassName={styles.children}
                icons={(
                    <div
                        ref={iconsRef}
                    />
                )}
                actions={(
                    <div
                        ref={actionsRef}
                    />
                )}
            >
                {children}
            </ElementFragments>
        </nav>
    );
}

export default SubNavbar;
