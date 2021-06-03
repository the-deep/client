import React, { useState, useCallback, useMemo } from 'react';
import {
    ElementFragments,
    ImagePreview,
    Button,
    Container,
    Modal,
    Tabs,
    Tab,
    TabList,
    TabPanel,
} from '@the-deep/deep-ui';
import { _cs, randomString } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import Canvas from '../Canvas';
import WidgetEditor from '../WidgetEditor';
import WidgetList from '../WidgetList';
import { PartialWidget } from '../WidgetPreview';
import { Section, Widget } from '../types';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import {
    TempWidget,
    findWidget,
    injectWidget,
    deleteWidget,
} from './utils';

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

    const initialSections = useMemo(
        () => [
            {
                clientId: randomString(),
                title: 'Operational Environment',
                widgets: [],
            },
        ],
        [],
    );

    const [selectedSection, setSelectedSection] = useState<string>(initialSections[0].clientId);

    const [sections, setSections] = useState<Section[]>(initialSections);

    const [tempSections, setTempSections] = useState<PartialSectionType[] | undefined>();

    const [tempWidget, setTempWidget] = useState<TempWidget | undefined>();

    const handleSectionsEdit = useCallback(
        () => {
            setTempSections(sections);
        },
        [sections],
    );

    const handleSectionsEditCancel = useCallback(
        () => {
            setTempSections(undefined);
        },
        [],
    );

    const handleTempSectionsChange = setTempSections;

    const handleTempSectionsSave = useCallback(
        (value: Section[]) => {
            setTempSections(undefined);
            setSections(value);
        },
        [],
    );

    const handleWidgetAdd = useCallback(
        (value: PartialWidget) => {
            setTempWidget({
                sectionId: selectedSection,
                widget: value,
            });
        },
        [selectedSection],
    );

    const handleWidgetDeleteClick = useCallback(
        (widgetId: string, sectionId: string) => {
            setSections(oldSections => deleteWidget(oldSections, sectionId, widgetId));
        },
        [],
    );

    const handleWidgetEditClick = useCallback(
        (widgetId: string, sectionId: string) => {
            const widget = findWidget(sections, sectionId, widgetId);
            if (widget) {
                setTempWidget({
                    sectionId,
                    widget,
                });
            }
        },
        [sections],
    );

    const handleWidgetEditCancel = useCallback(
        () => {
            setTempWidget(undefined);
        },
        [],
    );

    const handleTempWidgetChange = useCallback(
        (value: PartialWidget, sectionId: string) => {
            setTempWidget({
                sectionId,
                widget: value,
            });
        },
        [],
    );

    const handleTempWidgetSave = useCallback(
        (value: Widget, sectionId: string) => {
            setTempWidget(undefined);
            setSections(oldSections => injectWidget(oldSections, sectionId, value));
        },
        [],
    );

    const appliedSections = useMemo(
        () => {
            const mySections = tempSections ?? sections;
            if (tempWidget) {
                return injectWidget(mySections, tempWidget.sectionId, tempWidget.widget);
            }
            return mySections;
        },
        [sections, tempSections, tempWidget],
    );

    const sectionEditMode = !!tempSections && !tempWidget;
    const widgetEditMode = !tempSections && !!tempWidget;

    const editMode = sectionEditMode || widgetEditMode;

    return (
        <div className={_cs(styles.primaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                heading={_ts('analyticalFramework.primaryTagging', 'buildingModulesHeading')}
                sub
            >
                {!editMode && (
                    <WidgetList
                        onSectionsEdit={handleSectionsEdit}
                        onWidgetAdd={handleWidgetAdd}
                    />
                )}
                {sectionEditMode && tempSections && (
                    <SectionsEditor
                        initialValue={tempSections}
                        onChange={handleTempSectionsChange}
                        onSave={handleTempSectionsSave}
                        onCancel={handleSectionsEditCancel}
                    />
                )}
                {widgetEditMode && tempWidget && (
                    <WidgetEditor
                        name={tempWidget.sectionId}
                        initialValue={tempWidget.widget}
                        onChange={handleTempWidgetChange}
                        onSave={handleTempWidgetSave}
                        onCancel={handleWidgetEditCancel}
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
                    <div className={styles.canvas}>
                        <TabList className={styles.tabs}>
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
                        {appliedSections.map(section => (
                            <TabPanel
                                key={section.clientId}
                                name={section.clientId}
                                className={styles.panel}
                            >
                                <Canvas
                                    name={selectedSection}
                                    widgets={section.widgets}
                                    onWidgetDelete={handleWidgetDeleteClick}
                                    onWidgetEdit={handleWidgetEditClick}
                                    editMode={editMode}
                                />
                            </TabPanel>
                        ))}
                    </div>
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
