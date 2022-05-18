import React, { useState, useMemo } from 'react';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import SubNavbarContext from '#components/SubNavbar/context';

import ExportDetailsForm from './ExportDetailsForm';

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
            <SubNavbarContext.Provider value={navbarContextValue}>
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
                    <ExportDetailsForm />
                </div>
            </SubNavbarContext.Provider>
        </div>
    );
}

export default NewExport;
