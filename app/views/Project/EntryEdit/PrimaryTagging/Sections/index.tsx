import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';

import { Section } from '#types/newAnalyticalFramework';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import Canvas from '../../components/Canvas';
// import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
    sections: Section[];
    frameworkId: string;
}

function Sections(props: Props) {
    const {
        className,
        sections,
        frameworkId,
    } = props;

    const [selectedSection, setSelectedSection] = useState<string | undefined>(
        sections[0]?.clientId,
    );

    return (
        <Container
            className={_cs(className, styles.sections)}
            headerActions={frameworkId && (
                <FrameworkImageButton
                    frameworkId={frameworkId}
                    label={_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                    variant="secondary"
                />
            )}
            contentClassName={styles.content}
        >
            <Tabs
                value={selectedSection}
                onChange={setSelectedSection}
                variant="step"
            >
                {/*
                    <NonFieldError error={error} />
                */}
                <TabList className={styles.tabs}>
                    {sections.map((section) => (
                        <Tab
                            key={section.clientId}
                            name={section.clientId}
                            borderWrapperClassName={styles.borderWrapper}
                            className={_cs(
                                styles.tab,
                                // analyzeErrors(error?.[section.clientId]) && styles.errored,
                            )}
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
                            name={section.clientId}
                            widgets={section.widgets}
                        />
                    </TabPanel>
                ))}
            </Tabs>
        </Container>
    );
}

export default Sections;
