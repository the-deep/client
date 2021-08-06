import React, { useState, useCallback } from 'react';
import {
    ContainerCard,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import useLocalStorage from '#hooks/useLocalStorage';
import _ts from '#ts';

import Canvas from '../Canvas';
import { Section, Widget } from '#types/newAnalyticalFramework';
import styles from './styles.css';

interface Props {
    className?: string;
}

function Review(props: Props) {
    const {
        className,
    } = props;
    const [sections] = useLocalStorage<Section[]>('primaryTagging', []);
    const [widgets] = useLocalStorage<Widget[]>('secondaryTagging', []);
    const [selectedSection, setSelectedSection] = useState<string>(sections[0]?.clientId);

    const handleTabChange = useCallback((newSelection: string) => {
        setSelectedSection(newSelection);
    }, []);

    return (
        <div className={_cs(styles.review, className)}>
            <ContainerCard
                className={styles.primaryTagging}
                heading={_ts('analyticalFramework.review', 'primaryTagging')}
            >
                <Tabs
                    value={selectedSection}
                    onChange={handleTabChange}
                    variant="step"
                >
                    <div className={styles.canvas}>
                        <TabList className={styles.tabs}>
                            {sections.map((section) => (
                                <Tab
                                    key={section.clientId}
                                    name={section.clientId}
                                    borderWrapperClassName={styles.borderWrapper}
                                    className={styles.tab}
                                    title={section.tooltip}
                                >
                                    {section.title}
                                </Tab>
                            ))}
                        </TabList>
                        {sections.map((section) => (
                            <TabPanel
                                key={section.clientId}
                                name={section.clientId}
                                className={styles.panel}
                            >
                                <Canvas
                                    name={selectedSection}
                                    widgets={section.widgets}
                                    editMode={false}
                                />
                            </TabPanel>
                        ))}
                    </div>
                </Tabs>
            </ContainerCard>
            <ContainerCard
                className={styles.secondaryTagging}
                heading={_ts('analyticalFramework.review', 'secondaryTagging')}
            >
                <Canvas
                    name={undefined}
                    widgets={widgets}
                    editMode={false}
                />
            </ContainerCard>
        </div>
    );
}

export default Review;
