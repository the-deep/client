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
    QuickActionButton,
    ButtonProps,
} from '@the-deep/deep-ui';
import { _cs, randomString } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import Canvas from '../Canvas';
import WidgetEditor from '../WidgetEditor';
import WidgetList from '../WidgetList';
import { PartialWidget } from '../WidgetPreview';
import { Section, Widget, Matrix1dWidget, Matrix2dWidget } from '../types';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import {
    TempWidget,
    findWidget,
    injectWidget,
    deleteWidget,
} from './utils';

import styles from './styles.scss';

// FIXME: this is just temporary data. should remove this later on
const matrix1d: Matrix1dWidget = {
    clientId: 'just-some-random-thing',
    type: 'matrix-1d',
    title: 'Matrix 1d',
    order: 1,
    width: 'full',
    condition: [],
    data: {
        rows: [
            {
                clientId: '1',
                label: 'Context',
                color: 'white',
                cells: [
                    {
                        clientId: '1-1',
                        label: 'Environment',
                    },
                    {
                        clientId: '1-2',
                        label: 'Socio-cultural',
                    },
                    {
                        clientId: '1-3',
                        label: 'Economy',
                    },
                    {
                        clientId: '1-4',
                        label: 'Demography',
                    },
                    {
                        clientId: '1-5',
                        label: 'Legal',
                    },
                    {
                        clientId: '1-6',
                        label: 'Security',
                    },
                ],
            },
            {
                clientId: '2',
                label: 'Shock and Event',
                color: 'white',
                cells: [
                    {
                        clientId: '2-1',
                        label: 'Aggravating factors',
                    },
                    {
                        clientId: '2-2',
                        label: 'Type and characterstics',
                    },
                ],
            },
            {
                clientId: '3',
                label: 'Displacement Profile',
                color: 'white',
                cells: [
                    {
                        clientId: '3-1',
                        label: 'Type/number',
                    },
                    {
                        clientId: '3-2',
                        label: 'Movement',
                    },
                    {
                        clientId: '3-3',
                        label: 'Push factors',
                    },
                    {
                        clientId: '3-4',
                        label: 'Pull factors',
                    },
                    {
                        clientId: '3-5',
                        label: 'Intentions',
                    },
                    {
                        clientId: '3-6',
                        label: 'Local Integration',
                    },
                ],
            },
            {
                clientId: '4',
                label: 'Casualties',
                color: 'white',
                cells: [
                    {
                        clientId: '4-1',
                        label: 'Injured',
                    },
                    {
                        clientId: '4-2',
                        label: 'Missing',
                    },
                    {
                        clientId: '4-3',
                        label: 'Dead',
                    },
                ],
            },
            {
                clientId: '5',
                label: 'Humanitarian Access',
                color: 'white',
                cells: [
                    {
                        clientId: '5-1',
                        label: 'Relief to Beneficiaries',
                    },
                    {
                        clientId: '5-2',
                        label: 'Beneficiaries to Relief',
                    },
                    {
                        clientId: '5-3',
                        label: 'Physical Constraints',
                    },
                    {
                        clientId: '5-4',
                        label: 'Humanitarian Access Gap',
                    },
                ],
            },
            {
                clientId: '6',
                label: 'Information',
                color: 'white',
                cells: [
                    {
                        clientId: '6-1',
                        label: 'Communication Means',
                    },
                    {
                        clientId: '6-2',
                        label: 'Information Challenge',
                    },
                    {
                        clientId: '6-3',
                        label: 'Information Needs',
                    },
                    {
                        clientId: '6-4',
                        label: 'Information Gaps',
                    },
                ],
            },
        ],
    },
};

const matrix2d: Matrix2dWidget = {
    clientId: 'just-and-random-thing',
    type: 'matrix-2d',
    title: 'Matrix 2d',
    order: 2,
    width: 'full',
    condition: [],
    data: {
        rows: [
            {
                clientId: '1',
                label: 'Scope and Scale',
                color: 'white',
                subRows: [
                    {
                        clientId: '1-1',
                        label: 'Drivers/Aggravating Factors',
                    },
                    {
                        clientId: '1-2',
                        label: 'System Disruption',
                    },
                    {
                        clientId: '1-3',
                        label: 'Damages and Losses',
                    },
                    {
                        clientId: '1-4',
                        label: 'People Affected',
                    },
                ],
            },
            {
                clientId: '2',
                label: 'Humanitarian Conditions',
                color: 'white',
                subRows: [
                    {
                        clientId: '2-1',
                        label: 'Pilots/Conciliating Factors',
                    },
                    {
                        clientId: '2-2',
                        label: 'System Reconciliation',
                    },
                    {
                        clientId: '2-3',
                        label: 'Improvements and Wins',
                    },
                    {
                        clientId: '2-4',
                        label: 'Monkeys Affected',
                    },
                ],
            },
        ],
        columns: [
            {
                clientId: '1',
                label: 'Cross',
                subColumns: [],
            },
            {
                clientId: '2',
                label: 'Food',
                subColumns: [],
            },
            {
                clientId: '3',
                label: 'Livelihoods',
                subColumns: [],
            },
            {
                clientId: '4',
                label: 'Health',
                subColumns: [],
            },
            {
                clientId: '5',
                label: 'Nutrition',
                subColumns: [],
            },
            {
                clientId: '6',
                label: 'WASH',
                subColumns: [],
            },
            {
                clientId: '7',
                label: 'Protection',
                subColumns: [],
            },
            {
                clientId: '8',
                label: 'Education',
                subColumns: [],
            },
            {
                clientId: '9',
                label: 'Shelter',
                subColumns: [],
            },
            {
                clientId: '10',
                label: 'Agriculture',
                subColumns: [],
            },
            {
                clientId: '11',
                label: 'Logistics',
                subColumns: [],
            },
        ],
    },
};

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
        (): Section[] => [
            {
                clientId: randomString(),
                title: 'Operational Environment',
                widgets: [matrix1d, matrix2d],
            },
        ],
        [],
    );

    const [selectedSection, setSelectedSection] = useState<string>(initialSections[0].clientId);

    const [sections, setSections] = useState<Section[]>(initialSections);

    const [tempSections, setTempSections] = useState<PartialSectionType[] | undefined>();

    const [tempWidget, setTempWidget] = useState<TempWidget | undefined>();

    const [sectionToEdit, setSectionToEdit] = useState<string | undefined>(undefined);

    const handleSectionsAdd = useCallback(
        () => {
            const newClientId = randomString();
            setSectionToEdit(newClientId);
            setTempSections([
                ...sections,
                { clientId: newClientId },
            ]);
        },
        [sections],
    );
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

    const handleSectionEditClick: ButtonProps<string>['onClick'] = useCallback((newSectionToEdit, event) => {
        event.stopPropagation();
        setSectionToEdit(newSectionToEdit);
        handleSectionsEdit();
    }, [handleSectionsEdit]);

    const handleTabChange = useCallback((newSelection: string) => {
        setSelectedSection(newSelection);
    }, []);

    const sectionEditMode = !!tempSections && !tempWidget;
    const widgetEditMode = !tempSections && !!tempWidget;

    const editMode = sectionEditMode || widgetEditMode;

    return (
        <div className={_cs(styles.primaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                contentClassName={styles.widgetListContent}
                heading={_ts('analyticalFramework.primaryTagging', 'buildingModulesHeading')}
                horizontallyCompactContent
            >
                {!editMode && (
                    <WidgetList
                        onSectionsAdd={handleSectionsAdd}
                        onWidgetAdd={handleWidgetAdd}
                    />
                )}
                {sectionEditMode && tempSections && (
                    <SectionsEditor
                        initialValue={tempSections}
                        focusedSection={sectionToEdit}
                        onFocusChange={setSectionToEdit}
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
                    onChange={handleTabChange}
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
                                variant="secondary"
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
                                    borderWrapperClassName={styles.borderWrapper}
                                    className={styles.tab}
                                    title={section.tooltip}
                                    // FIXME: use strings
                                >
                                    {section.title || 'Unnamed'}
                                    <QuickActionButton
                                        className={styles.sectionEditButton}
                                        name={section.clientId}
                                        disabled={editMode}
                                        onClick={handleSectionEditClick}
                                    >
                                        <FiEdit2 />
                                    </QuickActionButton>
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
