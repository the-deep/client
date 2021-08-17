import React, { useContext, useEffect, useRef } from 'react';
import {
    Heading,
} from '@the-deep/deep-ui';
import ReactDOM from 'react-dom';
import { _cs } from '@togglecorp/fujs';

import NavbarContext from './context';
import styles from './styles.css';

interface ChildrenProps {
    children: React.ReactNode;
}
export function Children(props: ChildrenProps) {
    const {
        children,
    } = props;
    const {
        childrenNode,
    } = useContext(NavbarContext);
    if (!childrenNode) {
        return null;
    }
    return ReactDOM.createPortal(
        children,
        childrenNode,
    );
}

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
    children?: React.ReactNode;

    defaultActions?: React.ReactNode;
    defaultIcons?: React.ReactNode;

    heading?: string;
    description?: string;
}
function SubNavbar(props: SubNavbarProps) {
    const {
        children,
        className,
        defaultActions,
        defaultIcons,
        heading,
        description,
    } = props;

    const { setActionsNode, setIconsNode, setChildrenNode } = useContext(NavbarContext);

    const actionsRef = useRef(null);
    const iconsRef = useRef(null);
    const childrenRef = useRef(null);

    useEffect(
        () => {
            if (setActionsNode) {
                setActionsNode(actionsRef.current);
            }
        },
        [setActionsNode],
    );
    useEffect(
        () => {
            if (setIconsNode) {
                setIconsNode(iconsRef.current);
            }
        },
        [setIconsNode],
    );
    useEffect(
        () => {
            if (setChildrenNode) {
                setChildrenNode(childrenRef.current);
            }
        },
        [setChildrenNode],
    );

    return (
        <nav className={_cs(className, styles.subNavbar)}>
            <div
                ref={iconsRef}
                className={styles.icons}
            >
                {defaultIcons}
            </div>
            {heading && (
                <Heading
                    size="medium"
                    className={styles.heading}
                >
                    {heading}
                </Heading>
            )}
            {description && (
                <div className={styles.descriptionContainer}>
                    <div className={styles.description}>
                        {description}
                    </div>
                </div>
            )}
            <div
                ref={childrenRef}
                className={styles.children}
            >
                {children}
            </div>
            <div
                ref={actionsRef}
                className={styles.actions}
            >
                {defaultActions}
            </div>
        </nav>
    );
}

export default SubNavbar;
