import React, { useState, useCallback } from 'react';
import {
    ContainerCard,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';
import _ts from '#ts';

import { Section, Widget } from '#types/newAnalyticalFramework';
import Canvas from '../components/Canvas';
import { WidgetsType, SectionsType } from '../schema';
import styles from './styles.css';

interface Props {
    className?: string;
    primaryTagging: SectionsType | undefined;
    secondaryTagging: WidgetsType | undefined;
}

function Review(props: Props) {
    const {
        primaryTagging: primaryTaggingFromProps = [],
        secondaryTagging: secondaryTaggingFromProps = [],
        className,
    } = props;

    const primaryTagging = primaryTaggingFromProps as Section[];
    const secondaryTagging = secondaryTaggingFromProps as Widget[];

    const [selectedSection, setSelectedSection] = useState<string | undefined>(
        primaryTagging[0]?.clientId,
    );

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
                            {primaryTagging.map((section) => (
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
                        {primaryTagging.map((section) => (
                            <TabPanel
                                key={section.clientId}
                                name={section.clientId}
                                className={styles.panel}
                            >
                                <Canvas
                                    name={selectedSection}
                                    widgets={section.widgets}
                                    editMode={false}
                                    disabled
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
                    widgets={secondaryTagging}
                    editMode={false}
                    disabled
                />
            </ContainerCard>
        </div>
    );
}

export default Review;