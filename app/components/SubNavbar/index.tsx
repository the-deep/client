import React, { useContext, useEffect, useRef } from 'react';
import {
    Heading,
    Border,
    Svg,
} from '@the-deep/deep-ui';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { _cs } from '@togglecorp/fujs';
import deepLogo from '#resources/img/deep-logo-new.svg';
import route from '#base/configs/routes';

import NavbarContext from './context';
import styles from './styles.css';

interface SubNavbarChildrenProps {
    children: React.ReactNode;
}
export function SubNavbarChildren(props: SubNavbarChildrenProps) {
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

interface SubNavbarIconsProps {
    children: React.ReactNode;
}
export function SubNavbarIcons(props: SubNavbarIconsProps) {
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

interface SubNavbarActionsProps {
    children: React.ReactNode;
}
export function SubNavbarActions(props: SubNavbarActionsProps) {
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
    iconsClassName?: string;
    actionsClassName?: string;
    headingClassName?: string;
    childrenClassName?: string;
    descriptionClassName?: string;
    descriptionContainerClassName?: string;
    children?: React.ReactNode;

    defaultActions?: React.ReactNode;
    defaultIcons?: React.ReactNode;

    heading?: string;
    description?: string;

    homeLinkShown?: boolean;
}
function SubNavbar(props: SubNavbarProps) {
    const {
        children,
        iconsClassName,
        actionsClassName,
        headingClassName,
        className,
        defaultActions,
        defaultIcons,
        heading,
        childrenClassName,
        descriptionClassName,
        descriptionContainerClassName,
        description,
        homeLinkShown,
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
                key="icons"
                ref={iconsRef}
                className={_cs(styles.icons, iconsClassName)}
            >
                {homeLinkShown && (
                    <Link
                        to={route.home.path}
                        className={styles.appBrand}
                    >
                        <Svg
                            className={styles.logo}
                            src={deepLogo}
                        />
                    </Link>
                )}
                {defaultIcons}
                {heading && (
                    <Heading
                        size="medium"
                        className={_cs(styles.heading, headingClassName)}
                    >
                        {heading}
                    </Heading>
                )}
                {description && (
                    <div
                        className={_cs(styles.descriptionContainer, descriptionContainerClassName)}
                    >
                        <div className={_cs(styles.description, descriptionClassName)}>
                            {description}
                        </div>
                    </div>
                )}
            </div>
            <div
                ref={childrenRef}
                key="children"
                className={_cs(styles.children, childrenClassName)}
            >
                {children}
            </div>
            <div
                ref={actionsRef}
                key="actions"
                className={_cs(styles.actions, actionsClassName)}
            >
                {defaultActions}
            </div>
            <Border width="thin" />
        </nav>
    );
}

export default SubNavbar;
