import React, { useState, useMemo, useCallback } from 'react';
import {
    useParams,
    useLocation,
    Prompt,
} from 'react-router-dom';
import {
    isNotDefined,
    _cs,
    listToMap,
    randomString,
    isDefined,
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
    useAlert,
} from '@the-deep/deep-ui';
import {
    useForm,
    removeNull,
    useFormArray,
    useFormObject,
    SetValueArg,
    isCallable,
    createSubmitHandler,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery, gql } from '@apollo/client';

import ProjectContext from '#base/context/ProjectContext';
import { useRequest } from '#base/utils/restRequest';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import {
    schema as leadSchema,
    PartialFormType as PartialLeadFormType,
    Lead,
} from '#components/lead/LeadEditForm/schema';
import {
    ProjectFrameworkQuery,
    ProjectFrameworkQueryVariables,
    BulkUpdateEntriesMutation,
    BulkUpdateEntriesMutationVariables,
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

const BULK_UPDATE_ENTRIES = gql`
mutation BulkUpdateEntries($projectId:ID!, $deleteIds:[ID!], $entries: [BulkEntryInputType!]) {
    project(id: $projectId) {
        entryBulk(deleteIds: $deleteIds, items: $entries) {
            errors
            result {
                id
            }
            deletedResult {
                id
            }
        }
    }
}
`;

interface Props {
    className?: string;
}

function EntryEdit(props: Props) {
    const { className } = props;
    const { project } = React.useContext(ProjectContext);
    const { leadId } = useParams<{ leadId: string }>();
    const projectId = project ? project.id : undefined;

    const alert = useAlert();
    const location = useLocation();

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

    const [, setStaleIndices] = useState<number[] | undefined>(undefined);

    const [
        bulkUpdateEntries,
        // { loading: bulkUpdateEntriesPending },
    ] = useMutation<BulkUpdateEntriesMutation, BulkUpdateEntriesMutationVariables>(
        BULK_UPDATE_ENTRIES,
        {
            onCompleted: (response) => {
                setStaleIndices(undefined);
                // eslint-disable-next-line no-console
                console.warn(response);
            },
            onError: (gqlError) => {
                setStaleIndices(undefined);
                alert.show(
                    'Failed to update tags!',
                    { variant: 'error' },
                );
                // eslint-disable-next-line no-console
                console.error(gqlError);
            },
        },
    );

    const {
        value: formValue,
        setValue: setFormValue,
        setFieldValue: setFormFieldValue,
        setError: setFormError,
        pristine: formPristine,
        validate: formValidate,
        hasRestorePoint: isEntrySelectionActive,
        restore,
        createRestorePoint,
        clearRestorePoint,
        error: formError,
    } = useForm(schema, defaultFormValues);

    const handleSubmit = useCallback(
        () => {
            if (!projectId) {
                // eslint-disable-next-line no-console
                console.error('No project id');
                return;
            }
            const submit = createSubmitHandler(
                formValidate,
                setFormError,
                (value) => {
                    const entriesWithIndex = value.entries
                        ?.map((item, index) => ({ entry: item, index }));

                    const deletedValues = entriesWithIndex
                        ?.filter((item) => item.entry.deleted);
                    const deleteIds = deletedValues
                        ?.map((item) => item.entry.id)
                        .filter(isDefined);

                    const staleItems = entriesWithIndex
                        ?.filter((item) => item.entry.stale && !item.entry.deleted);

                    const staleIndices = staleItems?.map((item) => item.index);
                    const staleEntries = staleItems
                        ?.map((item) => item.entry)
                        .map((entry) => ({
                            ...entry,
                            deleted: undefined,
                            stale: undefined,
                            attributes: entry.attributes?.map((attribute) => ({
                                ...attribute,
                                widgetType: undefined,
                            })),
                        }));

                    // FIXME: clear this on any error
                    setStaleIndices(staleIndices);

                    // FIXME: handle when there is no stale and no entries
                    bulkUpdateEntries({
                        variables: {
                            projectId,
                            deleteIds,
                            entries: staleEntries,
                        },
                    });
                },
            );
            submit();
        },
        [setFormError, formValidate, bulkUpdateEntries, projectId],
    );

    const [selectedEntry, setSelectedEntry] = useState<string | undefined>();

    const handleEntryClick = useCallback((entryId: string) => {
        createRestorePoint();
        setSelectedEntry(entryId);
    }, [createRestorePoint]);

    const currentEntryIndex = formValue.entries?.findIndex(
        (entry) => entry.clientId === selectedEntry,
    ) ?? -1;

    const currentEntry = formValue.entries?.[currentEntryIndex];

    // FIXME: memoize this
    const entriesError = getErrorObject(getErrorObject(formError)?.entries);

    // FIXME: memoize this
    const currentEntryError = currentEntry
        ? entriesError?.[currentEntry.clientId]
        : undefined;

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
            createRestorePoint();
            // FIXME: iterate over widgets to create attributes with default values
            setFormFieldValue(
                (prevValue: PartialFormType['entries']) => [...(prevValue ?? []), { ...newValue, stale: true }],
                'entries',
            );
            setSelectedEntry(newValue.clientId);
        },
        [setFormFieldValue, createRestorePoint],
    );

    const handleEntryChangeApprove = useCallback(
        () => {
            clearRestorePoint();
            setSelectedEntry(undefined);
        },
        [clearRestorePoint],
    );

    const handleEntryChangeDiscard = useCallback(
        () => {
            restore();
            setSelectedEntry(undefined);
        },
        [restore],
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
            clearRestorePoint();
            onEntryFieldChange(true, 'deleted');
            setSelectedEntry(undefined);
        },
        [onEntryFieldChange, clearRestorePoint],
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
            error: entriesError?.[entryId],
        }),
        [
            entryImagesMap,
            frameworkDetails?.secondaryTagging,
            frameworkDetails?.primaryTagging,
            handleEntryChange,
            leadId,
            selectedEntry,
            entriesError,
        ],
    );

    return (
        <div className={_cs(styles.entryEdit, className)}>
            <Prompt
                message={(newLocation) => {
                    if (newLocation.pathname !== location.pathname && !formPristine) {
                        return _ts('common', 'youHaveUnsavedChanges');
                    }
                    return true;
                }}
            />
            <Tabs
                useHash
                defaultHash="source-details"
            >
                <SubNavbar
                    className={styles.header}
                    heading="Source"
                    description={lead?.title}
                    defaultActions={(
                        <>
                            <BackLink defaultLink="/">
                                Close
                            </BackLink>
                            <Button
                                name={undefined}
                                // NOTE: To be fixed later
                                disabled={formPristine}
                                onClick={handleSubmit}
                            >
                                Save
                            </Button>
                            {/*
                            <Button
                                name={undefined}
                                // NOTE: To be fixed later
                                disabled
                            >
                                Save Source
                            </Button>
                            <Button
                                name={undefined}
                                // NOTE: To be fixed later
                                disabled
                            >
                                Finalize
                            </Button>
                            */}
                        </>
                    )}
                >
                    <TabList>
                        <Tab
                            name="source-details"
                            transparentBorder
                            disabled={isEntrySelectionActive}
                        >
                            Source Details
                        </Tab>
                        <Tab
                            name="primary-tagging"
                            transparentBorder
                            disabled={isEntrySelectionActive}
                        >
                            Primary Tagging
                        </Tab>
                        <Tab
                            name="secondary-tagging"
                            transparentBorder
                            disabled={isEntrySelectionActive}
                        >
                            Secondary Tagging
                        </Tab>
                        <Tab
                            name="review"
                            transparentBorder
                            disabled={isEntrySelectionActive}
                        >
                            Review
                        </Tab>
                    </TabList>
                </SubNavbar>
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
                                disabled
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
                                    onEntryClick={handleEntryClick}
                                    onEntryCreate={handleEntryCreate}
                                    onApproveButtonClick={handleEntryChangeApprove}
                                    onDiscardButtonClick={handleEntryChangeDiscard}
                                    onEntryDelete={handleEntryDelete}
                                    onExcerptChange={handleExcerptChange}
                                    lead={lead}
                                    leadId={leadId}
                                    entryImagesMap={entryImagesMap}
                                    isEntrySelectionActive={isEntrySelectionActive}
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
                                                    error={currentEntryError}
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
                                    onEntryClick={handleEntryClick}
                                    onEntryCreate={handleEntryCreate}
                                    onEntryDelete={handleEntryDelete}
                                    onExcerptChange={handleExcerptChange}
                                    onApproveButtonClick={handleEntryChangeApprove}
                                    onDiscardButtonClick={handleEntryChangeDiscard}
                                    lead={lead}
                                    leadId={leadId}
                                    hideSimplifiedPreview
                                    hideOriginalPreview
                                    entryImagesMap={entryImagesMap}
                                    isEntrySelectionActive={isEntrySelectionActive}
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
                                        error={currentEntryError}
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
