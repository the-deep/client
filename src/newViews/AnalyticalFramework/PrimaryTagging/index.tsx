import React, { useState, useCallback, useMemo } from 'react';
import produce from 'immer';
import {
    IoCreateOutline,
} from 'react-icons/io5';
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
    QuickActionButton,
} from '@the-deep/deep-ui';
import { _cs, randomString, isNotDefined } from '@togglecorp/fujs';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import WidgetPreview from './WidgetPreview';
import WidgetEditor from './WidgetEditor';
import { Section, Widget, PartialForm } from './types';
import styles from './styles.scss';


type PartialWidget = PartialForm<
    Widget,
    'clientId' | 'type'
>;

interface TempWidget {
    sectionId: string;
    widget: PartialWidget;
}

function findWidget(sections: Section[], sectionId: string, widgetId: string): Widget | undefined {
    const selectedSectionIndex = sections.findIndex(s => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        console.error('The selected section does not exist:', sectionId);
        return undefined;
    }
    const selectedSection = sections[selectedSectionIndex];

    return selectedSection.widgets?.find(
        w => w.clientId === widgetId,
    );
}

function injectWidget(sections: Section[], sectionId: string, widget: Widget): Section[];
// eslint-disable-next-line max-len
function injectWidget(sections: PartialSectionType[], sectionId: string, widget: PartialWidget): PartialSectionType[];
function injectWidget(sections: PartialSectionType[], sectionId: string, widget: PartialWidget) {
    const selectedSectionIndex = sections.findIndex(s => s.clientId === sectionId);
    if (selectedSectionIndex === -1) {
        console.error('The selected section does not exist:', sectionId);
        return sections;
    }

    return produce(sections, (safeSections) => {
        const selectedSection = safeSections[selectedSectionIndex];

        const widgetIndex = selectedSection.widgets?.findIndex(
            w => w.clientId === widget.clientId,
        );

        if (!selectedSection.widgets) {
            selectedSection.widgets = [];
        }

        if (isNotDefined(widgetIndex) || widgetIndex === -1) {
            selectedSection.widgets.push(widget);
        } else {
            selectedSection.widgets.splice(widgetIndex, 1, widget);
        }
    });
}

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
            {
                clientId: randomString(),
                title: 'Temp Env',
                widgets: [],
            },
        ],
        [],
    );

    const [selectedSection, setSelectedSection] = useState<string>(initialSections[0].clientId);

    const [sections, setSections] = useState<Section[]>(initialSections);

    const [tempSections, setTempSections] = useState<PartialSectionType[] | undefined>();

    const [tempWidget, setTempWidget] = useState<TempWidget | undefined>();

    const handleSectionsChange = setTempSections;

    const handleSectionsEditClick = useCallback(
        () => {
            setTempSections(sections);
        },
        [sections],
    );

    const handleSectionsSave = useCallback(
        (value: Section[]) => {
            setTempSections(undefined);
            setSections(value);
        },
        [],
    );

    const handleSectionsEditCancel = useCallback(
        () => {
            setTempSections(undefined);
        },
        [],
    );

    const handleTextWidgetAddClick = useCallback(
        () => {
            setTempWidget({
                sectionId: selectedSection,
                widget: {
                    clientId: randomString(),
                    type: 'text',
                },
            });
        },
        [selectedSection],
    );

    const handleDateWidgetAddClick = useCallback(
        () => {
            setTempWidget({
                sectionId: selectedSection,
                widget: {
                    clientId: randomString(),
                    type: 'date',
                },
            });
        },
        [selectedSection],
    );

    const handleWidgetEditClick = useCallback(
        (widgetId: string) => {
            const widget = findWidget(sections, selectedSection, widgetId);
            if (widget) {
                setTempWidget({
                    sectionId: selectedSection,
                    widget,
                });
            }
        },
        [selectedSection, sections],
    );

    const handleWidgetChange = useCallback(
        (value: PartialWidget, sectionId: string) => {
            setTempWidget({
                sectionId,
                widget: value,
            });
        },
        [],
    );

    const handleWidgetSave = useCallback(
        (value: Widget, sectionId: string) => {
            setTempWidget(undefined);
            setSections(oldSections => injectWidget(oldSections, sectionId, value));
        },
        [],
    );

    const handleWidgetEditCancel = useCallback(
        () => {
            setTempWidget(undefined);
        },
        [],
    );

    const handleWidgetValueChange = useCallback(
        (value: unknown, name: string) => {
            console.warn('Trying to set value', value, 'on', name);
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
                    <Button
                        name={undefined}
                        onClick={handleSectionsEditClick}
                        // FIXME: use strings
                    >
                        Edit Sections
                    </Button>
                )}
                {!editMode && (
                    <>
                        <Button
                            name={undefined}
                            onClick={handleTextWidgetAddClick}
                            // FIXME: use strings
                        >
                            Add Text Widget
                        </Button>
                        <Button
                            name={undefined}
                            onClick={handleDateWidgetAddClick}
                            // FIXME: use strings
                        >
                            Add Date Widget
                        </Button>
                    </>
                )}
                {sectionEditMode && tempSections && (
                    <SectionsEditor
                        initialValue={tempSections}
                        onChange={handleSectionsChange}
                        onSave={handleSectionsSave}
                        onCancel={handleSectionsEditCancel}
                    />
                )}
                {widgetEditMode && tempWidget && (
                    <WidgetEditor
                        sectionId={tempWidget.sectionId}
                        initialValue={tempWidget.widget}
                        onChange={handleWidgetChange}
                        onSave={handleWidgetSave}
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
                    {appliedSections.map(section => (
                        <TabPanel
                            key={section.clientId}
                            name={section.clientId}
                            className={styles.panel}
                        >
                            {section.widgets?.map(widget => (
                                <WidgetPreview
                                    key={widget.clientId}
                                    name={widget.clientId}
                                    value={undefined}
                                    onChange={handleWidgetValueChange}
                                    widget={widget}
                                    readOnly
                                    actions={(
                                        <QuickActionButton
                                            name={widget.clientId}
                                            onClick={handleWidgetEditClick}
                                            // FIXME: use translation
                                            title="Edit Widget"
                                            disabled={editMode}
                                        >
                                            <IoCreateOutline />
                                        </QuickActionButton>
                                    )}
                                />
                            ))}
                        </TabPanel>
                    ))}
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
