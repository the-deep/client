import React, { useState, useCallback, useMemo } from 'react';
import {
    ElementFragments,
    Button,
    Container,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    QuickActionButton,
    ButtonProps,
} from '@the-deep/deep-ui';
import { _cs, randomString } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';

import useLocalStorage from '#hooks/useLocalStorage';
import _ts from '#ts';
import { sortByOrder } from '#utils/common';
import FrameworkImageButton from '#components/FrameworkImageButton';

import Canvas from '../Canvas';
import WidgetEditor from '../WidgetEditor';
import WidgetList from '../WidgetList';
import { PartialWidget } from '../WidgetPreview';
import { Section, Widget, Matrix1dWidget, Matrix2dWidget } from '#types/newAnalyticalFramework';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import {
    TempWidget,
    findWidget,
    injectWidget,
    orderWidgets,
    deleteWidget,
} from './utils';

import styles from './styles.css';

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
                order: -1,
                cells: [
                    {
                        clientId: '1-1',
                        label: 'Environment',
                        order: -1,
                    },
                    {
                        clientId: '1-2',
                        label: 'Socio-cultural',
                        order: -1,
                    },
                    {
                        clientId: '1-3',
                        label: 'Economy',
                        order: -1,
                    },
                    {
                        clientId: '1-4',
                        label: 'Demography',
                        order: -1,
                    },
                    {
                        clientId: '1-5',
                        label: 'Legal',
                        order: -1,
                    },
                    {
                        clientId: '1-6',
                        label: 'Security',
                        order: -1,
                    },
                ],
            },
            {
                clientId: '2',
                label: 'Shock and Event',
                order: -1,
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '2-1',
                        label: 'Aggravating factors',
                    },
                    {
                        order: -1,
                        clientId: '2-2',
                        label: 'Type and characterstics',
                    },
                ],
            },
            {
                clientId: '3',
                label: 'Displacement Profile',
                order: -1,
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '3-1',
                        label: 'Type/number',
                    },
                    {
                        order: -1,
                        clientId: '3-2',
                        label: 'Movement',
                    },
                    {
                        order: -1,
                        clientId: '3-3',
                        label: 'Push factors',
                    },
                    {
                        order: -1,
                        clientId: '3-4',
                        label: 'Pull factors',
                    },
                    {
                        order: -1,
                        clientId: '3-5',
                        label: 'Intentions',
                    },
                    {
                        order: -1,
                        clientId: '3-6',
                        label: 'Local Integration',
                    },
                ],
            },
            {
                order: -1,
                clientId: '4',
                label: 'Casualties',
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '4-1',
                        label: 'Injured',
                    },
                    {
                        order: -1,
                        clientId: '4-2',
                        label: 'Missing',
                    },
                    {
                        order: -1,
                        clientId: '4-3',
                        label: 'Dead',
                    },
                ],
            },
            {
                order: -1,
                clientId: '5',
                label: 'Humanitarian Access',
                color: 'white',
                cells: [
                    {
                        order: -1,
                        clientId: '5-1',
                        label: 'Relief to Beneficiaries',
                    },
                    {
                        order: -1,
                        clientId: '5-2',
                        label: 'Beneficiaries to Relief',
                    },
                    {
                        order: -1,
                        clientId: '5-3',
                        label: 'Physical Constraints',
                    },
                    {
                        order: -1,
                        clientId: '5-4',
                        label: 'Humanitarian Access Gap',
                    },
                ],
            },
            {
                clientId: '6',
                label: 'Information',
                color: 'white',
                order: -1,
                cells: [
                    {
                        order: -1,
                        clientId: '6-1',
                        label: 'Communication Means',
                    },
                    {
                        order: -1,
                        clientId: '6-2',
                        label: 'Information Challenge',
                    },
                    {
                        order: -1,
                        clientId: '6-3',
                        label: 'Information Needs',
                    },
                    {
                        order: -1,
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
                order: -1,
                label: 'Scope and Scale',
                color: 'white',
                subRows: [
                    {
                        order: -1,
                        clientId: '1-1',
                        label: 'Drivers/Aggravating Factors',
                    },
                    {
                        order: -1,
                        clientId: '1-2',
                        label: 'System Disruption',
                    },
                    {
                        order: -1,
                        clientId: '1-3',
                        label: 'Damages and Losses',
                    },
                    {
                        order: -1,
                        clientId: '1-4',
                        label: 'People Affected',
                    },
                ],
            },
            {
                order: -1,
                clientId: '2',
                label: 'Humanitarian Conditions',
                color: 'white',
                subRows: [
                    {
                        order: -1,
                        clientId: '2-1',
                        label: 'Pilots/Conciliating Factors',
                    },
                    {
                        order: -1,
                        clientId: '2-2',
                        label: 'System Reconciliation',
                    },
                    {
                        order: -1,
                        clientId: '2-3',
                        label: 'Improvements and Wins',
                    },
                    {
                        order: -1,
                        clientId: '2-4',
                        label: 'Monkeys Affected',
                    },
                ],
            },
        ],
        columns: [
            {
                clientId: '1',
                order: -1,
                label: 'Cross',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '2',
                label: 'Food',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '3',
                label: 'Livelihoods',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '4',
                label: 'Health',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '5',
                label: 'Nutrition',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '6',
                label: 'WASH',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '7',
                label: 'Protection',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '8',
                label: 'Education',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '9',
                label: 'Shelter',
                subColumns: [],
            },
            {
                order: -1,
                clientId: '10',
                label: 'Agriculture',
                subColumns: [],
            },
            {
                order: -1,
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
    // eslint-disable-next-line no-console
    console.info('primary tagging in the framework', frameworkId);

    const initialSections = useMemo(
        (): Section[] => [
            {
                clientId: randomString(),
                title: 'Operational Environment',
                widgets: [matrix1d, matrix2d],
                order: 0,
            },
        ],
        [],
    );

    const [sections, setSections] = useLocalStorage<Section[]>('primaryTagging', initialSections);

    const [selectedSection, setSelectedSection] = useState<string>(sections[0]?.clientId);

    const [tempSections, setTempSections] = useState<PartialSectionType[] | undefined>();

    const [tempWidget, setTempWidget] = useState<TempWidget | undefined>();

    const [sectionToEdit, setSectionToEdit] = useState<string | undefined>(undefined);

    const handleSectionsAdd = useCallback(
        () => {
            const newClientId = randomString();
            setSectionToEdit(newClientId);
            setTempSections([
                ...sections,
                {
                    clientId: newClientId,
                    order: sections.length,
                },
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
        [setSections],
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
            setSections((oldSections) => deleteWidget(oldSections, sectionId, widgetId));
        },
        [setSections],
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

    const handleWidgetOrderChange = useCallback(
        (newWidgets: Widget[]) => {
            setSections((oldSections) => orderWidgets(oldSections, selectedSection, newWidgets));
        },
        [selectedSection, setSections],
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
            setSections((oldSections) => injectWidget(oldSections, sectionId, value));
        },
        [setSections],
    );

    type AppliedSections = {
        editMode: false;
        appliedSections: Section[];
    } | {
        editMode: true;
        appliedSections: PartialSectionType[];
    };

    const sectionsState = useMemo(
        (): AppliedSections => {
            if (tempSections) {
                const mySections = sortByOrder(tempSections);
                if (tempWidget) {
                    return {
                        editMode: true,
                        appliedSections: injectWidget(
                            mySections,
                            tempWidget.sectionId,
                            tempWidget.widget,
                        ),
                    };
                }
                return {
                    editMode: true,
                    appliedSections: mySections,
                };
            }
            const mySections = sortByOrder(sections);
            if (tempWidget) {
                return {
                    editMode: true,
                    appliedSections: injectWidget(
                        mySections,
                        tempWidget.sectionId,
                        tempWidget.widget,
                    ),
                };
            }
            return {
                editMode: false,
                appliedSections: mySections,
            };
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

    return (
        <div className={_cs(styles.primaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                contentClassName={styles.widgetListContent}
                heading={_ts('analyticalFramework.primaryTagging', 'buildingModulesHeading')}
                horizontallyCompactContent
            >
                {!sectionsState.editMode && (
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
                        className={styles.widgetEditor}
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
                            <FrameworkImageButton
                                frameworkId={frameworkId}
                                label={_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                                variant="secondary"
                            />
                        </ElementFragments>
                    </div>
                    <div className={styles.canvas}>
                        <TabList className={styles.tabs}>
                            {sectionsState.editMode ? (
                                sectionsState.appliedSections.map((section) => (
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
                                            onClick={handleSectionEditClick}
                                            disabled
                                        >
                                            <FiEdit2 />
                                        </QuickActionButton>
                                    </Tab>
                                ))
                            ) : (
                                sectionsState.appliedSections.map((section) => (
                                    <Tab
                                        key={section.clientId}
                                        name={section.clientId}
                                        borderWrapperClassName={styles.borderWrapper}
                                        className={styles.tab}
                                        title={section.tooltip}
                                        // FIXME: use strings
                                    >
                                        {section.title}
                                        <QuickActionButton
                                            className={styles.sectionEditButton}
                                            name={section.clientId}
                                            onClick={handleSectionEditClick}
                                        >
                                            <FiEdit2 />
                                        </QuickActionButton>
                                    </Tab>
                                ))
                            )}
                        </TabList>
                        {sectionsState.editMode ? (
                            sectionsState.appliedSections.map((section) => (
                                <TabPanel
                                    key={section.clientId}
                                    name={section.clientId}
                                    className={styles.panel}
                                >
                                    <Canvas
                                        name={selectedSection}
                                        widgets={section.widgets}
                                        editMode
                                    />
                                </TabPanel>
                            ))
                        ) : (
                            sectionsState.appliedSections.map((section) => (
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
                                        onWidgetOrderChange={handleWidgetOrderChange}
                                        editMode={false}
                                    />
                                </TabPanel>
                            ))
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

export default PrimaryTagging;
