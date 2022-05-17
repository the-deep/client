import React, { useState, useMemo } from 'react';
import {
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import SubNavbar, {
    SubNavbarChildren,
} from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import SubNavbarContext from '#components/SubNavbar/context';

import styles from './styles.css';

function NewExport() {
    const [childrenNode, setChildrenNode] = useState<Element | null | undefined>();
    const [actionsNode, setActionsNode] = useState<Element | null | undefined>();
    const [iconsNode, setIconsNode] = useState<Element | null | undefined>();
    const navbarContextValue = useMemo(
        () => ({
            childrenNode,
            iconsNode,
            actionsNode,
            setChildrenNode,
            setActionsNode,
            setIconsNode,
        }),
        [childrenNode, actionsNode, iconsNode],
    );
    return (
        <div className={styles.newExport}>
            <SubNavbar
                className={styles.header}
                heading="New Export"
                homeLinkShown
                defaultActions={(
                    <BackLink
                        defaultLink="/"
                    >
                        Close
                    </BackLink>
                )}
            />
            <div className={styles.content}>
                New Export Page
            </div>
        </div>
    );
}

export default NewExport;
