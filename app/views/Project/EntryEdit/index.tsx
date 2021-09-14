import React, { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    isNotDefined,
    _cs,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    PendingMessage,
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ListView,
    Container,
} from '@the-deep/deep-ui';
import {
    useForm,
    removeNull,
    useFormArray,
    useFormObject,
    SetValueArg,
    isCallable,
} from '@togglecorp/toggle-form';
import { useQuery } from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { useRequest } from '#base/utils/restRequest';
import FullPageHeader from '#components/FullPageHeader';
import BackLink from '#components/BackLink';
import {
    schema as leadSchema,
    PartialFormType as PartialLeadFormType,
    Lead,
} from '#components/lead/LeadEditForm/schema';
import {
    ProjectFrameworkQuery,
    ProjectFrameworkQueryVariables,
} from '#generated/types';
import EntryInput from '#components/entry/EntryInput';
import Section from '#components/entry/Section';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import _ts from '#ts';

import { PROJECT_FRAMEWORK } from './queries';

import SourceDetails from './SourceDetails';
import LeftPane from './LeftPane';

import schema, { defaultFormValues, PartialEntryType, PartialFormType } from './schema';
import { Entry, EntryInput as EntryInputType, Framework } from './types';
import styles from './styles.css';

export type EntryImagesMap = { [key: string]: Entry['image'] | undefined };

const entryKeySelector = (e: PartialEntryType) => e.clientId;

function transformEntry(entry: Entry): EntryInputType {
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
        attributes: entry.attributes?.map((attribute) => ({
            ...attribute,
            // NOTE: we don't need this on form
            geoSelectedOptions: undefined,
        })),
    });
}

interface Props {
    className?: string;
}

function EntryEdit(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);
    const { leadId } = useParams<{ leadId: string }>();
    const projectId = project ? project.id : undefined;

    // LEAD

    // FIXME: why have this ready/setReady state here?
    // leadId will always be defined anyway
    const [ready, setReady] = useState(!leadId);

    const [leadInitialValue, setLeadInitialValue] = useState<PartialLeadFormType>(() => ({
        project: projectId ? +projectId : undefined,
        sourceType: 'website',
        priority: 100,
        confidentiality: 'unprotected',
        isAssessmentLead: false,
    }));

    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: randomString(),
            entryType: 'EXCERPT',
            lead: leadId,
        }),
        [leadId],
    );

    const {
        value: leadValue,
        setFieldValue: setLeadFieldValue,
        setValue: setLeadValue,
        setPristine: setLeadPristine,
        error: leadFormError,
    } = useForm(leadSchema, leadInitialValue);

    const {
        pending: leadGetPending,
        response: lead,
    } = useRequest<Lead>({
        skip: !leadId,
        url: `server://v2/leads/${leadId}/`,
        onSuccess: (response) => {
            setLeadInitialValue(response);
            setLeadValue(response);
            setReady(true);
        },
        failureHeader: 'Leads',
    });

    // ENTRY FORM

    const {
        value: formValue,
        setValue: setFormValue,
        setFieldValue: setFormFieldValue,
        // error: formError,
    } = useForm(schema, defaultFormValues);

    const [selectedEntry, setSelectedEntry] = useState<string | undefined>();

    const currentEntryIndex = formValue.entries?.findIndex(
        (entry) => entry.clientId === selectedEntry,
    ) ?? -1;

    const currentEntry = formValue.entries?.[currentEntryIndex];

    const {
        setValue: onEntryChange,
    } = useFormArray<'entries', PartialEntryType>('entries', setFormFieldValue);

    const handleEntryChange = useCallback(
        (val: SetValueArg<PartialEntryType>, otherName: number | undefined) => {
            onEntryChange(
                (oldValue) => {
                    const newVal = !isCallable(val)
                        ? val
                        : val(oldValue);
                    return { ...newVal, stale: true };
                },
                otherName,
            );
        },
        [onEntryChange],
    );

    const handleEntryCreate = useCallback(
        (newValue: PartialEntryType) => {
            // TODO: start snapshot mode

            // FIXME: iterate over widgets to create attributes with default values
            setFormFieldValue(
                (prevValue: PartialFormType['entries']) => [...(prevValue ?? []), newValue],
                'entries',
            );
            setSelectedEntry(newValue.clientId);
        },
        [setFormFieldValue],
    );

    const handleEntryChangeApprove = useCallback(
        () => {
            // TODO: clear snapshot
            setSelectedEntry(undefined);
        },
        [],
    );

    const handleEntryChangeDiscard = useCallback(
        () => {
            // TODO: restore snapshot
            setSelectedEntry(undefined);
        },
        [],
    );

    const onEntryFieldChange = useFormObject(
        currentEntryIndex === -1 ? undefined : currentEntryIndex,
        handleEntryChange,
        defaultOptionVal,
    );

    const handleExcerptChange = useCallback(
        (_: string, excerpt: string | undefined) => {
            onEntryFieldChange(excerpt, 'excerpt');
        },
        [onEntryFieldChange],
    );

    const handleEntryDelete = useCallback(
        () => {
            onEntryFieldChange(true, 'deleted');
        },
        [onEntryFieldChange],
    );

    // NOTE: we are creating a map of index and value because we are iterating
    // over widgets but modifying attributes
    const attributesMap = useMemo(() => (
        listToMap(
            currentEntry?.attributes ?? [],
            (d) => d.widget,
            (d, _, i) => ({
                index: i,
                value: d,
            }),
        )
    ), [currentEntry?.attributes]);

    const {
        setValue: onAttributeChange,
    } = useFormArray('attributes', onEntryFieldChange);

    // ENTRY

    // FIXME: set section initially
    const [selectedSection, setSelectedSection] = useState<string | undefined>();
    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();

    const variables = useMemo(
        (): ProjectFrameworkQueryVariables | undefined => (
            (leadId && projectId)
                ? { projectId, leadId }
                : undefined
        ),
        [
            leadId,
            projectId,
        ],
    );

    const {
        data,
        loading,
    } = useQuery<ProjectFrameworkQuery, ProjectFrameworkQueryVariables>(
        PROJECT_FRAMEWORK,
        {
            skip: isNotDefined(variables),
            variables,
            onCompleted: (response) => {
                const projectFromResponse = response?.project;
                if (!projectFromResponse) {
                    return;
                }

                const leadFromResponse = projectFromResponse.lead;
                if (leadFromResponse) {
                    const entries = leadFromResponse.entries?.map(
                        (entry) => transformEntry(entry as Entry),
                    );
                    setFormValue((oldVal) => ({ ...oldVal, entries }));
                    const imagesMap = listToMap(
                        leadFromResponse.entries,
                        (d) => d.clientId,
                        (d) => d.image,
                    );
                    setEntryImagesMap(imagesMap);
                }

                const analysisFrameworkFromResponse = projectFromResponse.analysisFramework;
                if (analysisFrameworkFromResponse) {
                    const firstSection = analysisFrameworkFromResponse?.primaryTagging?.[0];
                    setSelectedSection(firstSection?.clientId);
                }
            },
        },
    );
    const frameworkDetails = data?.project?.analysisFramework as Framework | undefined | null;

    const entryDataRendererParams = useCallback(
        (entryId: string, datum: PartialEntryType, index: number) => ({
            value: datum,
            name: index,
            index,
            onChange: handleEntryChange,
            secondaryTagging: frameworkDetails?.secondaryTagging,
            primaryTagging: frameworkDetails?.primaryTagging,
            leadId,
            disabled: !!selectedEntry,
            entryImage: entryImagesMap?.[entryId],
            // error,
        }),
        [
            entryImagesMap,
            frameworkDetails?.secondaryTagging,
            frameworkDetails?.primaryTagging,
            handleEntryChange,
            leadId,
            selectedEntry,
        ],
    );

    return (
        <div className={_cs(styles.entryEdit, className)}>
            <Tabs
                useHash
                defaultHash="source-details"
            >
                <FullPageHeader
                    className={styles.header}
                    heading="Source"
                    description={lead?.title}
                    actions={(
                        <>
                            <BackLink defaultLink="/">
                                Close
                            </BackLink>
                            <Button
                                name={undefined}
                                variant="secondary"
                                // NOTE: To be fixed later
                                disabled
                            >
                                Save
                            </Button>
                            <Button
                                name={undefined}
                                // NOTE: To be fixed later
                                disabled
                            >
                                Finalize
                            </Button>
                        </>
                    )}
                >
                    <TabList>
                        <Tab
                            name="source-details"
                            transparentBorder
                        >
                            Source Details
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            transparentBorder
                        >
                            Primary Tagging
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            transparentBorder
                        >
                            Secondary Tagging
                        </Tab>
                        <Tab
                            name="review"
                            transparentBorder
                        >
                            Review
                        </Tab>
                    </TabList>
                </FullPageHeader>
                <div className={styles.tabPanelContainer}>
                    {loading && <PendingMessage />}
                    <TabPanel
                        className={styles.tabPanel}
                        name="source-details"
                    >
                        {projectId && (
                            <SourceDetails
                                leadValue={leadValue}
                                setValue={setLeadValue}
                                setPristine={setLeadPristine}
                                setLeadFieldValue={setLeadFieldValue}
                                leadFormError={leadFormError}
                                ready={ready}
                                pending={leadGetPending}
                                leadInitialValue={leadInitialValue}
                                projectId={+projectId}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
                        name="primary-tagging"
                    >
                        {frameworkDetails && (
                            <div className={styles.primaryTagging}>
                                <LeftPane
                                    className={styles.sourcePreview}
                                    entries={formValue.entries}
                                    activeEntry={selectedEntry}
                                    onEntryClick={setSelectedEntry}
                                    onEntryCreate={handleEntryCreate}
                                    onApproveButtonClick={handleEntryChangeApprove}
                                    onDiscardButtonClick={handleEntryChangeDiscard}
                                    onEntryDelete={handleEntryDelete}
                                    onExcerptChange={handleExcerptChange}
                                    lead={lead}
                                    leadId={leadId}
                                    entryImagesMap={entryImagesMap}
                                />
                                <Container
                                    className={_cs(className, styles.sections)}
                                    headerActions={(
                                        <FrameworkImageButton
                                            frameworkId={frameworkDetails.id}
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
                                        <TabList className={styles.tabs}>
                                            {frameworkDetails.primaryTagging?.map((section) => (
                                                <Tab
                                                    key={section.clientId}
                                                    name={section.clientId}
                                                    borderWrapperClassName={styles.borderWrapper}
                                                    className={_cs(
                                                        styles.tab,
                                                        // analyzeErrors(error?.[section.clientId])
                                                        // && styles.errored,
                                                    )}
                                                    title={section.tooltip ?? undefined}
                                                >
                                                    {section.title}
                                                </Tab>
                                            ))}
                                        </TabList>
                                        {frameworkDetails.primaryTagging?.map((section) => (
                                            <TabPanel
                                                key={section.clientId}
                                                name={section.clientId}
                                                className={styles.panel}
                                            >
                                                <Section
                                                    widgets={section.widgets}
                                                    attributesMap={attributesMap}
                                                    onAttributeChange={onAttributeChange}
                                                    readOnly={!currentEntry}
                                                />
                                            </TabPanel>
                                        ))}
                                    </Tabs>
                                </Container>
                            </div>
                        )}
                    </TabPanel>
                    <TabPanel
                        className={styles.tabPanel}
                        name="secondary-tagging"
                    >
                        {frameworkDetails && (
                            <div className={styles.secondaryTagging}>
                                <LeftPane
                                    className={styles.sourcePreview}
                                    entries={formValue.entries}
                                    activeEntry={selectedEntry}
                                    onEntryClick={setSelectedEntry}
                                    onEntryCreate={handleEntryCreate}
                                    onEntryDelete={handleEntryDelete}
                                    onExcerptChange={handleExcerptChange}
                                    lead={lead}
                                    leadId={leadId}
                                    hideSimplifiedPreview
                                    hideOriginalPreview
                                    entryImagesMap={entryImagesMap}
                                />
                                <Container
                                    className={styles.rightContainer}
                                    contentClassName={styles.frameworkOutput}
                                    headerActions={(
                                        <FrameworkImageButton
                                            frameworkId={frameworkDetails.id}
                                            label={_ts('analyticalFramework.primaryTagging', 'viewFrameworkImageButtonLabel')}
                                            variant="secondary"
                                        />
                                    )}
                                >
                                    <Section
                                        widgets={frameworkDetails.secondaryTagging}
                                        attributesMap={attributesMap}
                                        onAttributeChange={onAttributeChange}
                                        readOnly={!currentEntry}
                                    />
                                </Container>
                            </div>
                        )}
                    </TabPanel>
                    <TabPanel
                        name="review"
                        className={styles.tabPanel}
                    >
                        {frameworkDetails && (
                            <Container
                                className={styles.review}
                                headerActions={(
                                    <FrameworkImageButton
                                        frameworkId={frameworkDetails.id}
                                        label="View framework image for reference"
                                        variant="secondary"
                                    />
                                )}
                            >
                                <ListView
                                    className={styles.entries}
                                    keySelector={entryKeySelector}
                                    renderer={EntryInput}
                                    data={formValue.entries}
                                    rendererParams={entryDataRendererParams}
                                />
                            </Container>
                        )}
                    </TabPanel>
                </div>
            </Tabs>
        </div>
    );
}

export default EntryEdit;
