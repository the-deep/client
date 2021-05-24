import React, { useState, useCallback } from 'react';

import {
    ElementFragments,
    ImagePreview,
    Button,
    Container,
    Modal,
    Tabs,
    Tab,
    TabList,
} from '@the-deep/deep-ui';
import { _cs, randomString } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import { Section } from './types';
import styles from './styles.scss';

interface Props {
    className?: string;
    frameworkId: number;
}

function PrimaryTagging(props: Props) {
    const {
        className,
        frameworkId,
    } = props;

    // NOTE: intentional console.info
    console.info('primary tagging in the framework', frameworkId);

    const [
        showPreviewModal,
        setShowPreviewModalTrue,
        setShowPreviewModalFalse,
    ] = useModalState(false);

    const [selectedSection, setSelectedSection] = useState<string>('test');
    const [
        sectionEditMode,
        setSectionEditMode,
        unsetSectionEditMode,
    ] = useModalState(false);

    const [sections, setSections] = useState<Section[]>(() => [
        {
            clientId: randomString(),
            title: 'Operational Environment',
            widgets: [],
        },
        {
            clientId: randomString(),
            title: 'My Analogies',
            widgets: [],
        },
    ]);

    const [tempSections, setTempSections] = useState<PartialSectionType[] | undefined>();

    const handleSectionSave = useCallback(
        (value: Section[]) => {
            setTempSections(undefined);
            setSections(value);
            unsetSectionEditMode();
        },
        [unsetSectionEditMode],
    );

    const handleSectionCancel = useCallback(
        () => {
            setTempSections(undefined);
            unsetSectionEditMode();
        },
        [unsetSectionEditMode],
    );

    const appliedSections = tempSections ?? sections;

    return (
        <div className={_cs(styles.primaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                heading={_ts('analyticalFramework.primaryTagging', 'buildingModulesHeading')}
                sub
            >
                {!sectionEditMode && (
                    <Button
                        name={undefined}
                        onClick={setSectionEditMode}
                        // FIXME: use strings
                    >
                        Edit Sections
                    </Button>
                )}
                {sectionEditMode && (
                    <SectionsEditor
                        initialValue={sections}
                        onChange={setTempSections}
                        onSave={handleSectionSave}
                        onCancel={handleSectionCancel}
                    />
                )}
            </Container>
            <div className={styles.frameworkPreview}>
                <Tabs
                    value={selectedSection}
                    onChange={setSelectedSection}
                    variant="step"
                >
                    <div className={styles.topBar}>
                        <ElementFragments
                            actions={(
                                <Button
                                    name={undefined}
                                    disabled
                                >
                                    {_ts('analyticalFramework.primaryTagging', 'nextButtonLabel')}
                                </Button>
                            )}
                        >
                            <Button
                                name={undefined}
                                variant="inverted"
                                onClick={setShowPreviewModalTrue}
                            >
                                {_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                            </Button>
                        </ElementFragments>
                    </div>
                    <TabList>
                        {appliedSections.map(section => (
                            <Tab
                                key={section.clientId}
                                name={section.clientId}
                                className={styles.tab}
                                // FIXME: use strings
                            >
                                {section.title || 'Unnamed'}
                            </Tab>
                        ))}
                    </TabList>
                </Tabs>
            </div>
            {showPreviewModal && (
                <Modal
                    className={styles.frameworkImagePreviewModal}
                    onCloseButtonClick={setShowPreviewModalFalse}
                    bodyClassName={styles.body}
                >
                    <ImagePreview
                        className={styles.preview}
                        src="https://i.imgur.com/3Zk4aNH.jpg"
                        alt="Under construction"
                    />
                </Modal>
            )}
        </div>
    );
}

export default PrimaryTagging;
