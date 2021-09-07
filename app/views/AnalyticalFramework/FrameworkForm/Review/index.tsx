import React, { useState } from 'react';
import {
    ContainerCard,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { _cs } from '@togglecorp/fujs';

import _ts from '#ts';

import Canvas from '#views/Project/EntryEdit/components/Canvas';
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

    const primaryTagging = primaryTaggingFromProps;
    const secondaryTagging = secondaryTaggingFromProps;

    const [selectedSection, setSelectedSection] = useState<string | undefined>(
        primaryTagging[0]?.clientId,
    );

    return (
        <div className={_cs(styles.review, className)}>
            <ContainerCard
                className={styles.card}
                heading={_ts('analyticalFramework.review', 'primaryTagging')}
                contentClassName={styles.primaryTaggingContent}
            >
                <Tabs
                    value={selectedSection}
                    onChange={setSelectedSection}
                    variant="step"
                >
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
                        >
                            <Canvas
                                name={selectedSection}
                                widgets={section.widgets}
                            />
                        </TabPanel>
                    ))}
                </Tabs>
            </ContainerCard>
            <ContainerCard
                className={styles.card}
                heading={_ts('analyticalFramework.review', 'secondaryTagging')}
            >
                <Canvas
                    name={undefined}
                    widgets={secondaryTagging}
                />
            </ContainerCard>
        </div>
    );
}

export default Review;
