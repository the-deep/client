import React, { useState, useCallback, useMemo } from 'react';
import {
    Button,
    Container,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    QuickActionButton,
    ButtonProps,
} from '@the-deep/deep-ui';
import {
    Error,
    SetValueArg,
    getErrorObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import { _cs, randomString } from '@togglecorp/fujs';
import { FiEdit2 } from 'react-icons/fi';

import _ts from '#ts';
import { sortByOrder } from '#utils/common';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import NonFieldError from '#components/NonFieldError';
import { PartialWidget } from '#components/framework/AttributeInput';

import { SectionsType } from '../schema';
import Canvas from '../components/Canvas';
import WidgetEditor from '../components/WidgetEditor';
import WidgetList from '../components/WidgetList';
import { Section, Widget } from '../../types';
import { cloneWidget } from '../../utils';

import SectionsEditor, { PartialSectionType } from './SectionsEditor';
import {
    TempWidget,
    findWidget,
    injectWidget,
    orderWidgets,
    deleteWidget,
} from './utils';

import styles from './styles.css';

interface PrimaryTaggingInput<K extends string> {
    className?: string;
    frameworkId: number | undefined;

    name: K;
    value: SectionsType | undefined;
    error: Error<SectionsType> | undefined;
    onChange: (value: SetValueArg<SectionsType | undefined>, name: K) => void;
    disabled?: boolean;
}

function PrimaryTaggingInput<K extends string>(props: PrimaryTaggingInput<K>) {
    const {
        className,
        frameworkId,
        name,
        value: sectionsFromProps = [],
        onChange: setSectionsFromProps,
        disabled,
        error: errorFromProps,
    } = props;

    const sections = sectionsFromProps;
    const setSections = setSectionsFromProps;
    const riskyError = errorFromProps;

    // NOTE: typescript couldn't infer the type here
    const error = getErrorObject<Section>(riskyError);

    const [selectedSection, setSelectedSection] = useState<string | undefined>(
        sections[0]?.clientId,
    );

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
            setSections(value, name);
        },
        [setSections, name],
    );

    const handleWidgetAdd = useCallback(
        (value: PartialWidget) => {
            if (selectedSection) {
                setTempWidget({
                    sectionId: selectedSection,
                    widget: value,
                });
            }
        },
        [selectedSection],
    );

    const handleWidgetDeleteClick = useCallback(
        (widgetId: string, sectionId: string) => {
            setSections((oldSections) => deleteWidget(oldSections, sectionId, widgetId), name);
        },
        [setSections, name],
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

    const handleWidgetClone = useCallback(
        (widgetId: string, sectionId: string) => {
            const widget = findWidget(sections, sectionId, widgetId);
            if (widget) {
                const clonedWidget = cloneWidget(widget);
                if (clonedWidget) {
                    setTempWidget({
                        sectionId,
                        widget: clonedWidget,
                    });
                }
            }
        },
        [sections],
    );

    const handleWidgetOrderChange = useCallback(
        (newWidgets: Widget[]) => {
            if (selectedSection) {
                setSections(
                    (oldSections) => orderWidgets(oldSections, selectedSection, newWidgets),
                    name,
                );
            }
        },
        [selectedSection, setSections, name],
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
            setSections((oldSections) => injectWidget(oldSections, sectionId, value), name);
        },
        [setSections, name],
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

    const handleTabChange = useCallback((newSelection: string | undefined) => {
        setSelectedSection(newSelection);
    }, []);

    const sectionEditMode = !!tempSections && !tempWidget;
    const widgetEditMode = !tempSections && !!tempWidget;

    const validSectionSelected = useMemo(
        () => (
            !!selectedSection
            && !!sections.find((section) => section.clientId === selectedSection)
        ),
        [sections, selectedSection],
    );

    return (
        <div className={_cs(styles.primaryTagging, className)}>
            <Container
                className={styles.widgetListContainer}
                contentClassName={styles.widgetListContent}
                heading={_ts('analyticalFramework.primaryTagging', 'buildingModulesHeading')}
                headingSize="small"
            >
                {!sectionsState.editMode && (
                    <WidgetList
                        onSectionsAdd={handleSectionsAdd}
                        onWidgetAdd={handleWidgetAdd}
                        disabled={disabled}
                        widgetsDisabled={!validSectionSelected}
                    />
                )}
                {sectionEditMode && tempSections && (
                    // NOTE: no need to disable as this is used as modal
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
            <Tabs
                value={selectedSection}
                onChange={handleTabChange}
                variant="step"
            >
                <Container
                    className={styles.frameworkPreview}
                    headerIcons={frameworkId && (
                        <FrameworkImageButton
                            frameworkId={frameworkId}
                            label={_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                            variant="secondary"
                        />
                    )}
                    headerActions={(
                        <Button
                            name={undefined}
                            disabled
                        >
                            {_ts('analyticalFramework.primaryTagging', 'nextButtonLabel')}
                        </Button>
                    )}
                    contentClassName={styles.content}
                >
                    <NonFieldError error={error} />
                    <TabList className={styles.tabs}>
                        {sectionsState.editMode ? (
                            sectionsState.appliedSections.map((section) => (
                                <Tab
                                    key={section.clientId}
                                    name={section.clientId}
                                    borderWrapperClassName={styles.borderWrapper}
                                    className={_cs(
                                        styles.tab,
                                        analyzeErrors(error?.[section.clientId]) && styles.errored,
                                    )}
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
                                    className={_cs(
                                        styles.tab,
                                        analyzeErrors(error?.[section.clientId]) && styles.errored,
                                    )}
                                    title={section.tooltip}
                                >
                                    {section.title}
                                    <QuickActionButton
                                        className={styles.sectionEditButton}
                                        name={section.clientId}
                                        onClick={handleSectionEditClick}
                                        disabled={disabled}
                                        // FIXME: use strings
                                        title="Edit"
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
                                    name={section.clientId}
                                    widgets={section.widgets}
                                    editMode
                                    disabled={disabled}
                                    error={
                                        getErrorObject(error?.[section.clientId])?.widgets
                                    }
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
                                    name={section.clientId}
                                    widgets={section.widgets}
                                    onWidgetDelete={handleWidgetDeleteClick}
                                    onWidgetEdit={handleWidgetEditClick}
                                    onWidgetOrderChange={handleWidgetOrderChange}
                                    onWidgetClone={handleWidgetClone}
                                    editMode={false}
                                    disabled={disabled}
                                    error={
                                        getErrorObject(error?.[section.clientId])?.widgets
                                    }
                                />
                            </TabPanel>
                        ))
                    )}
                </Container>
            </Tabs>
        </div>
    );
}

export default PrimaryTaggingInput;
