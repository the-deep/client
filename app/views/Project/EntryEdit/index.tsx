import React, { useState, useMemo, useCallback } from 'react';
import {
    useParams,
    useLocation,
    Prompt,
} from 'react-router-dom';
import {
    isNotDefined,
    _cs,
    unique,
    listToMap,
    randomString,
    isDefined,
    mapToMap,
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
    useFormArray,
    useFormObject,
    SetValueArg,
    isCallable,
    createSubmitHandler,
    getErrorObject,
    analyzeErrors,
    removeNull,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery } from '@apollo/client';

import { GeoArea } from '#components/GeoMultiSelectInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import BackLink from '#components/BackLink';
import {
    schema as leadSchema,
    PartialFormType as PartialLeadFormType,
} from '#components/lead/LeadInput/schema';
import {
    ProjectFrameworkQuery,
    ProjectFrameworkQueryVariables,
    LeadEntriesQuery,
    LeadEntriesQueryVariables,
    LeadInputType,
    BulkUpdateEntriesMutation,
    BulkUpdateEntriesMutationVariables,
    LeadUpdateMutation,
    LeadUpdateMutationVariables,
} from '#generated/types';
import Svg from '#components/Svg';
import deepLogo from '#resources/img/deep-logo-new.svg';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import EntryInput from '#components/entry/EntryInput';
import Section from '#components/entry/Section';
import FrameworkImageButton from '#components/framework/FrameworkImageButton';
import _ts from '#ts';

import {
    PROJECT_FRAMEWORK,
    BULK_UPDATE_ENTRIES,
    UPDATE_LEAD,
    LEAD_ENTRIES,
} from './queries';

import SourceDetails from './SourceDetails';
import LeftPane from './LeftPane';
import {
    CommentCountContext,
    CommentCountContextInterface,
} from './CommentContext';

import getSchema, { defaultFormValues, PartialEntryType, PartialFormType, PartialAttributeType } from './schema';
import EntryCommentWrapper from './EntryCommentWrapper';
import { Entry, EntryInput as EntryInputType, Framework } from './types';
import styles from './styles.css';

export type EntryImagesMap = { [key: string]: Entry['image'] | undefined };

const entryKeySelector = (e: PartialEntryType) => e.clientId;
export type Lead = NonNullable<NonNullable<LeadEntriesQuery['project']>['lead']>;

function transformEntry(entry: Entry): EntryInputType {
    // FIXME: make this re-usable
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
        // FIXME: try to filter out un-necessary attributes
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
    const [
        commentsCountMap,
        setCommentsCountMap,
    ] = useState<{ [key in string]: number } | undefined>(undefined);

    const commentCountContext: CommentCountContextInterface = useMemo(() => ({
        commentsCountMap,
        setCommentsCountMap,
    }), [commentsCountMap]);

    const projectId = project ? project.id : undefined;

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const alert = useAlert();
    const location = useLocation();

    const locationState = location?.state as {
        entryId?: string;
        sectionId?: string;
    } | undefined;

    const entryIdFromState = locationState?.entryId;
    const sectionIdFromState = locationState?.sectionId;

    // LEAD
    const [leadInitialValue] = useState<PartialLeadFormType>(() => ({
        clientId: randomString(),
        sourceType: 'WEBSITE',
        isAssessmentLead: false,
    }));

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>();

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>(undefined);

    const [isFinalizeClicked, setIsFinalizeClicked] = useState(false);

    const [selectedEntry, setSelectedEntry] = useState<string | undefined>(undefined);

    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: randomString(),
            entryType: 'EXCERPT',
            lead: leadId,
            excerpt: '',
            droppedExcerpt: '',
        }),
        [leadId],
    );

    const {
        pristine: leadPristine,
        value: leadValue,
        setValue: setLeadValue,
        setPristine: setLeadPristine,
        setError: setLeadError,
        error: leadFormError,
        validate: leadFormValidate,
    } = useForm(leadSchema, leadInitialValue);

    // ENTRY FORM

    // FIXME: set section initially
    const [selectedSection, setSelectedSection] = useState<string | undefined>();

    const frameworkVariables = useMemo(
        (): ProjectFrameworkQueryVariables | undefined => (
            projectId ? { projectId } : undefined
        ),
        [projectId],
    );
    const {
        data: frameworkData,
        loading: frameworkLoading,
    } = useQuery<ProjectFrameworkQuery, ProjectFrameworkQueryVariables>(
        PROJECT_FRAMEWORK,
        {
            skip: isNotDefined(frameworkVariables),
            variables: frameworkVariables,
            onCompleted: (response) => {
                const projectFromResponse = response?.project;
                if (!projectFromResponse) {
                    return;
                }
                const analysisFrameworkFromResponse = projectFromResponse.analysisFramework;
                if (analysisFrameworkFromResponse) {
                    const firstSection = analysisFrameworkFromResponse.primaryTagging?.[0];
                    const sectionFromState = analysisFrameworkFromResponse
                        .primaryTagging?.find((section) => section.id === sectionIdFromState);

                    setSelectedSection(
                        sectionFromState
                            ? sectionFromState.clientId
                            : firstSection?.clientId,
                    );
                }
            },
        },
    );

    // eslint-disable-next-line max-len
    const frameworkDetails = frameworkData?.project?.analysisFramework as Framework | undefined | null;

    // FIXME: memoize this
    const widgetsMapping = listToMap(
        [
            ...(frameworkDetails?.primaryTagging?.flatMap((item) => (item.widgets ?? [])) ?? []),
            ...(frameworkDetails?.secondaryTagging ?? []),
        ],
        (item) => item.id,
        (item) => item,
    );
    const schema = getSchema(widgetsMapping);

    const {
        value: formValue,
        setValue: setFormValue,
        setFieldValue: setFormFieldValue,
        setError: setFormError,
        // pristine: formPristine,
        validate: formValidate,
        hasRestorePoint: isEntrySelectionActive,
        restore,
        createRestorePoint,
        clearRestorePoint,
        error: formError,
    } = useForm(schema, defaultFormValues);

    const formStale = formValue?.entries?.some((entry) => entry.stale) ?? false;
    const formPristine = !formStale && leadPristine;

    const [staleIdentifiers, setStaleIdentifiers] = useState<string[] | undefined>(undefined);
    const [deleteIdentifiers, setDeleteIdentifiers] = useState<string[] | undefined>(undefined);
    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();

    const [
        updateLead,
        // { loading: leadUpdatePending },
    ] = useMutation<LeadUpdateMutation, LeadUpdateMutationVariables>(
        UPDATE_LEAD,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadUpdate) {
                    return;
                }
                const {
                    result,
                    ok,
                } = response.project.leadUpdate;

                if (!ok) {
                    alert.show(
                        'Failed to change lead status!',
                        { variant: 'error' },
                    );
                }
                alert.show(
                    'Successfully marked lead as tagged!',
                    { variant: 'success' },
                );
                const leadData = removeNull(result);
                setLeadValue({
                    ...leadData,
                    attachment: leadData?.attachment?.id,
                    leadGroup: leadData?.leadGroup?.id,
                    assignee: leadData?.assignee?.id,
                    source: leadData?.source?.id,
                    authors: leadData?.authors?.map((author) => author.id),
                });
            },
            onError: () => {
                alert.show(
                    'Failed to change lead status!',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleLeadSave = useCallback((finalized: boolean) => {
        if (!projectId || (!finalized && leadPristine)) {
            return;
        }
        setIsFinalizeClicked(false);
        const submit = createSubmitHandler(
            leadFormValidate,
            setLeadError,
            (val) => {
                const data = { ...val } as LeadInputType;
                updateLead({
                    variables: {
                        data: {
                            ...data,
                            status: finalized ? 'TAGGED' : undefined,
                        },
                        leadId,
                        projectId,
                    },
                });
            },
        );
        submit();
    }, [
        leadFormValidate,
        setLeadError,
        leadPristine,
        leadId,
        projectId,
        updateLead,
    ]);

    const [
        bulkUpdateEntries,
        // { loading: bulkUpdateEntriesPending },
    ] = useMutation<BulkUpdateEntriesMutation, BulkUpdateEntriesMutationVariables>(
        BULK_UPDATE_ENTRIES,
        {
            onCompleted: (response) => {
                const entryBulk = response.project?.entryBulk;
                if (!entryBulk) {
                    return;
                }
                const errors = entryBulk?.errors;
                const deletedResult = response.project?.entryBulk?.deletedResult;
                const saveResult = response.project?.entryBulk?.result;

                const entriesError = errors?.map((item, index) => {
                    if (isNotDefined(item)) {
                        return undefined;
                    }
                    const clientId = staleIdentifiers?.[index];
                    if (isNotDefined(clientId)) {
                        return undefined;
                    }

                    return {
                        clientId,
                        error: transformToFormError(removeNull(item) as ObjectError[]),
                    };
                }).filter(isDefined) ?? [];
                const entriesErrorMapping = listToMap(
                    entriesError,
                    (item) => item.clientId,
                    (item) => item.error,
                );

                const deletedEntries = deletedResult?.map((item, index) => {
                    if (isNotDefined(item)) {
                        return undefined;
                    }
                    const clientId = deleteIdentifiers?.[index];
                    return clientId;
                }).filter(isDefined) ?? [];

                const savedEntries = saveResult?.map((item, index) => {
                    if (item === null) {
                        return undefined;
                    }
                    const clientId = staleIdentifiers?.[index];
                    if (isNotDefined(clientId)) {
                        return undefined;
                    }

                    return {
                        clientId,
                        entry: transformEntry(item as Entry),
                    };
                }).filter(isDefined) ?? [];

                const savedEntriesMapping = listToMap(
                    savedEntries,
                    (item) => item.clientId,
                    (item) => item.entry,
                );

                const newImagesMap = listToMap(
                    saveResult?.map((item) => item?.image).filter(isDefined),
                    (item) => item.id,
                    (item) => item,
                );

                setEntryImagesMap((oldMap) => ({
                    ...oldMap,
                    ...newImagesMap,
                }));

                setFormValue((oldValue) => {
                    const entries = oldValue?.entries ?? [];
                    const filteredEntries = entries.filter((item) => (
                        !deletedEntries.includes(item.clientId)
                    ));

                    const mappedEntries = filteredEntries.map((item) => {
                        const newEntry = savedEntriesMapping[item.clientId];
                        return newEntry ?? item;
                    });
                    return {
                        entries: mappedEntries,
                    };
                }, true);

                setFormError((oldError) => {
                    const err = getErrorObject(oldError);
                    return {
                        ...err,
                        entries: {
                            ...getErrorObject(err?.entries),
                            ...entriesErrorMapping,
                        },
                    };
                });

                // eslint-disable-next-line max-len
                const deleteErrorsCount = entryBulk?.deletedResult?.filter(isNotDefined).length ?? 0;
                if (deleteErrorsCount > 0) {
                    alert.show(
                        `Failed to delete ${deleteErrorsCount} entries!`,
                        { variant: 'error' },
                    );
                }
                const deleteSuccessCount = entryBulk?.deletedResult?.filter(isDefined).length ?? 0;
                if (deleteSuccessCount > 0) {
                    alert.show(
                        `${deleteSuccessCount} entries deleted successfully!`,
                        { variant: 'success' },
                    );
                }

                const saveErrorsCount = entryBulk?.result?.filter(isNotDefined).length ?? 0;
                if (saveErrorsCount > 0) {
                    alert.show(
                        `Failed to save ${saveErrorsCount} entries!`,
                        { variant: 'error' },
                    );
                }
                const saveSuccessCount = entryBulk?.result?.filter(isDefined).length ?? 0;
                if (saveSuccessCount > 0) {
                    alert.show(
                        `${saveSuccessCount} entries saved successfully!`,
                        { variant: 'success' },
                    );
                }

                // eslint-disable-next-line max-len
                if (deleteErrorsCount + deleteSuccessCount + saveErrorsCount + saveSuccessCount <= 0) {
                    alert.show(
                        'Did nothing successfully!',
                        { variant: 'success' },
                    );
                }

                if (projectId && isFinalizeClicked) {
                    if (saveErrorsCount < 1 && deleteErrorsCount < 1) {
                        handleLeadSave(true);
                    } else {
                        handleLeadSave(false);
                        alert.show(
                            'Lead cannot be finalized due to some errors in entries.',
                            { variant: 'error' },
                        );
                    }
                }

                setStaleIdentifiers(undefined);
                setDeleteIdentifiers(undefined);
            },
            onError: (gqlError) => {
                setStaleIdentifiers(undefined);
                setDeleteIdentifiers(undefined);

                alert.show(
                    'Failed to save entries!',
                    { variant: 'error' },
                );
                // eslint-disable-next-line no-console
                console.error(gqlError);

                handleLeadSave(isFinalizeClicked);
                if (isFinalizeClicked) {
                    setIsFinalizeClicked(false);
                    alert.show(
                        'Failed to change lead status!',
                        { variant: 'error' },
                    );
                }
            },
        },
    );

    const handleSubmit = useCallback(
        (shouldSetFinalize: boolean) => {
            if (!projectId) {
                // eslint-disable-next-line no-console
                console.error('No project id');
                return;
            }
            const submit = createSubmitHandler(
                formValidate,
                setFormError,
                (value) => {
                    // FIXME: do not send entries with errors
                    const entriesWithError = value.entries ?? [];
                    const entriesWithoutError = (value.entries ?? []) as EntryInputType[];

                    const deletedEntries = entriesWithError
                        .filter((entry) => entry.deleted && entry.id);

                    const staleEntries = entriesWithoutError
                        .filter((entry) => entry.stale && !entry.deleted);

                    // NOTE: remembering the identifiers so that data and error
                    // can be patched later on
                    const deleteIds = deletedEntries?.map((entry) => entry.clientId);
                    const staleIds = staleEntries?.map((entry) => entry.clientId);
                    setStaleIdentifiers(staleIds);
                    setDeleteIdentifiers(deleteIds);

                    // NOTE: deleting all the entries that are not saved on server
                    setFormValue((oldValue) => ({
                        entries: oldValue.entries?.filter(
                            (entry) => entry.id || !entry.deleted,
                        ),
                    }));

                    if (deletedEntries.length > 0 || staleEntries.length > 0) {
                        const entryDeleteIds = deletedEntries
                            .map((entry) => entry.id)
                            // NOTE: we do not need this filter as entry.id is always defined
                            .filter(isDefined);

                        const transformedEntries = staleEntries
                            .map((entry) => ({
                                ...entry,
                                deleted: undefined,
                                stale: undefined,
                                attributes: entry.attributes
                                    ?.filter((attribute) => isDefined(attribute.data))
                                    .map((attribute) => ({
                                        ...attribute,
                                        widgetType: undefined,
                                    })),
                            }));

                        setIsFinalizeClicked(shouldSetFinalize);
                        bulkUpdateEntries({
                            variables: {
                                projectId,
                                deleteIds: entryDeleteIds,
                                entries: transformedEntries,
                            },
                        });
                    } else {
                        alert.show(
                            'Entries updated successfully!',
                            { variant: 'success' },
                        );
                    }
                },
            );
            submit();
        },
        [
            setFormError,
            formValidate,
            bulkUpdateEntries,
            projectId,
            alert,
            setFormValue,
        ],
    );

    const handleSaveClick = useCallback(
        () => handleSubmit(false),
        [handleSubmit],
    );

    const handleFinalizeClick = useCallback(
        () => {
            if (!formStale) {
                handleLeadSave(true);
            } else {
                handleSubmit(true);
            }
        },
        [handleSubmit, formStale, handleLeadSave],
    );

    const handleEntryClick = useCallback((entryId: string) => {
        createRestorePoint();
        setSelectedEntry(entryId);
    }, [createRestorePoint]);

    const currentEntryIndex = formValue.entries?.findIndex(
        (entry) => entry.clientId === selectedEntry,
    ) ?? -1;

    const currentEntry = formValue.entries?.[currentEntryIndex];

    const entriesError = useMemo(
        () => getErrorObject(getErrorObject(formError)?.entries),
        [formError],
    );

    const entriesErrorStateMap = useMemo(
        () => mapToMap(entriesError, (k) => k, (err) => analyzeErrors(err)),
        [entriesError],
    );

    const currentEntryError = currentEntry
        ? getErrorObject(entriesError?.[currentEntry.clientId])
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
            const widgetsFromPrimary = frameworkDetails?.primaryTagging?.flatMap(
                (section) => section.widgets,
            ).filter(isDefined) ?? [];
            const widgetsFromSecondary = frameworkDetails?.secondaryTagging ?? [];

            const defaultAttributes = [
                ...widgetsFromPrimary,
                ...widgetsFromSecondary,
            ].map((item) => {
                let attr: PartialAttributeType | undefined;
                const clientId = randomString();
                const widget = item.id;

                if (item.widgetId === 'TEXT' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'NUMBER' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'DATE' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'TIME' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'SCALE' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                }
                return attr;
            }).filter(isDefined);

            createRestorePoint();
            setFormFieldValue(
                (prevValue: PartialFormType['entries']) => [
                    ...(prevValue ?? []),
                    {
                        ...newValue,
                        stale: true,
                        attributes: defaultAttributes,
                    },
                ],
                'entries',
            );
            setSelectedEntry(newValue.clientId);
        },
        [
            setFormFieldValue,
            createRestorePoint,
            frameworkDetails?.primaryTagging,
            frameworkDetails?.secondaryTagging,
        ],
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

    const handleEntryRestore = useCallback(
        () => {
            clearRestorePoint();
            onEntryFieldChange(false, 'deleted');
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
    const handleAddButtonClick = useCallback((entryId: string, sectionId?: string) => {
        handleEntryClick(entryId);
        if (sectionId) {
            window.location.replace('#/primary-tagging');
            setSelectedSection(sectionId);
        } else {
            window.location.replace('#/secondary-tagging');
        }
    }, [handleEntryClick]);

    const entriesVariables = useMemo(
        (): LeadEntriesQueryVariables | undefined => (
            (leadId && projectId) ? { projectId, leadId } : undefined
        ),
        [
            leadId,
            projectId,
        ],
    );
    const {
        data,
        loading: entriesLoading,
    } = useQuery<LeadEntriesQuery, LeadEntriesQueryVariables>(
        LEAD_ENTRIES,
        {
            skip: isNotDefined(entriesVariables),
            variables: entriesVariables,
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
                    setCommentsCountMap(
                        listToMap(
                            leadFromResponse.entries ?? [],
                            (entry) => entry.id,
                            (entry) => entry.reviewCommentsCount,
                        ),
                    );
                    const geoData = leadFromResponse.entries
                        ?.map((entry) => entry?.attributes)
                        .flat()
                        .map((attributes) => attributes?.geoSelectedOptions)
                        .flat()
                        .filter(isDefined) ?? [];
                    const uniqueGeoData = unique(geoData, (d) => d.id);

                    setGeoAreaOptions(uniqueGeoData);
                    setFormValue((oldVal) => ({ ...oldVal, entries }));
                    const imagesMap = listToMap(
                        leadFromResponse.entries?.map((entry) => entry.image).filter(isDefined),
                        (d) => d.id,
                        (d) => d,
                    );
                    setEntryImagesMap(imagesMap);

                    if (entries?.some((entry) => entry.clientId === entryIdFromState)) {
                        createRestorePoint();
                        setSelectedEntry(entryIdFromState);
                    }

                    const leadData = removeNull(leadFromResponse);
                    setLeadValue({
                        ...leadData,
                        attachment: leadData.attachment?.id,
                        leadGroup: leadData.leadGroup?.id,
                        assignee: leadData.assignee?.id,
                        source: leadData.source?.id,
                        authors: leadData.authors?.map((author) => author.id),
                    });
                    const {
                        leadGroup,
                        assignee,
                        authors,
                        source,
                    } = leadData;

                    if (leadGroup) {
                        setLeadGroupOptions((oldVal) => (
                            oldVal ? [...oldVal, leadGroup] : [leadGroup]
                        ));
                    }
                    if (assignee) {
                        setProjectUserOptions((oldVal) => (
                            oldVal ? [...oldVal, assignee] : [assignee]
                        ));
                    }
                    if (source) {
                        setSourceOrganizationOptions((oldVal) => (
                            oldVal ? [...oldVal, source] : [source]
                        ));
                    }
                    if (authors) {
                        setAuthorOrganizationOptions((oldVal) => (
                            oldVal ? [...oldVal, ...authors] : [...authors]
                        ));
                    }
                }
            },
        },
    );

    const entryDataRendererParams = useCallback(
        (entryId: string, datum: PartialEntryType, index: number) => ({
            value: datum,
            name: index,
            projectId,
            index,
            onChange: handleEntryChange,
            secondaryTagging: frameworkDetails?.secondaryTagging,
            onAddButtonClick: handleAddButtonClick,
            primaryTagging: frameworkDetails?.primaryTagging,
            excerptHeaderActions: datum.id && projectId && (
                <EntryCommentWrapper
                    // FIXME: Remove cast after entry comments
                    // is switched to gql
                    entryId={+datum.id}
                    projectId={projectId}
                />
            ),
            leadId,
            disabled: !!selectedEntry,
            entryImage: datum?.image ? entryImagesMap?.[datum.image] : undefined,
            error: entriesError?.[entryId],
            geoAreaOptions,
            onGeoAreaOptionsChange: setGeoAreaOptions,
        }),
        [
            geoAreaOptions,
            projectId,
            handleAddButtonClick,
            entryImagesMap,
            frameworkDetails?.secondaryTagging,
            frameworkDetails?.primaryTagging,
            handleEntryChange,
            leadId,
            selectedEntry,
            entriesError,
        ],
    );

    const lead = data?.project?.lead;
    const loading = frameworkLoading || entriesLoading;

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
                    defaultIcons={(
                        <div className={styles.appBrand}>
                            <Svg
                                src={deepLogo}
                                className={styles.logo}
                            />
                        </div>
                    )}
                    defaultActions={(
                        <>
                            <BackLink defaultLink="/">
                                Close
                            </BackLink>
                            <Button
                                name={undefined}
                                disabled={formPristine || !!selectedEntry}
                                onClick={handleSaveClick}
                            >
                                Save
                            </Button>
                            <Button
                                name={undefined}
                                // NOTE: Enable when lead form is edited
                                disabled={(
                                    !formStale && leadValue.status === 'TAGGED'
                                ) || !!selectedEntry}
                                variant="primary"
                                onClick={handleFinalizeClick}
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
                <CommentCountContext.Provider value={commentCountContext}>
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
                                    defaultValue={leadInitialValue}
                                    leadFormError={leadFormError}
                                    pending={loading}
                                    projectId={projectId}
                                    sourceOrganizationOptions={sourceOrganizationOptions}
                                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                                    authorOrganizationOptions={authorOrganizationOptions}
                                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                                    leadGroupOptions={leadGroupOptions}
                                    onLeadGroupOptionsChange={setLeadGroupOptions}
                                    assigneeOptions={projectUserOptions}
                                    onAssigneeOptionChange={setProjectUserOptions}
                                    attachment={lead?.attachment}
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
                                        projectId={projectId}
                                        entries={formValue.entries}
                                        activeEntry={selectedEntry}
                                        onEntryClick={handleEntryClick}
                                        onEntryCreate={handleEntryCreate}
                                        onApproveButtonClick={handleEntryChangeApprove}
                                        onDiscardButtonClick={handleEntryChangeDiscard}
                                        onEntryDelete={handleEntryDelete}
                                        onEntryRestore={handleEntryRestore}
                                        onExcerptChange={handleExcerptChange}
                                        lead={lead}
                                        leadId={leadId}
                                        entryImagesMap={entryImagesMap}
                                        isEntrySelectionActive={isEntrySelectionActive}
                                        entriesError={entriesErrorStateMap}
                                        // NOTE: If entry Id comes from state, we need to
                                        // show entries tab as it always has the entry
                                        defaultTab={!entryIdFromState ? 'entries' : undefined}
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
                                                        borderWrapperClassName={
                                                            styles.borderWrapper
                                                        }
                                                        className={_cs(
                                                            styles.tab,
                                                            // analyzeErrors(
                                                            // error?.[section.clientId])
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
                                                        error={currentEntryError?.attributes}
                                                        geoAreaOptions={geoAreaOptions}
                                                        onGeoAreaOptionsChange={setGeoAreaOptions}
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
                                        projectId={projectId}
                                        entries={formValue.entries}
                                        activeEntry={selectedEntry}
                                        onEntryClick={handleEntryClick}
                                        onEntryCreate={handleEntryCreate}
                                        onEntryDelete={handleEntryDelete}
                                        onEntryRestore={handleEntryRestore}
                                        onExcerptChange={handleExcerptChange}
                                        onApproveButtonClick={handleEntryChangeApprove}
                                        onDiscardButtonClick={handleEntryChangeDiscard}
                                        lead={lead}
                                        leadId={leadId}
                                        hideSimplifiedPreview
                                        hideOriginalPreview
                                        entryImagesMap={entryImagesMap}
                                        isEntrySelectionActive={isEntrySelectionActive}
                                        entriesError={entriesErrorStateMap}
                                        defaultTab={!entryIdFromState ? 'entries' : undefined}
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
                                            error={currentEntryError?.attributes}
                                            geoAreaOptions={geoAreaOptions}
                                            onGeoAreaOptionsChange={setGeoAreaOptions}
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
                </CommentCountContext.Provider>
            </Tabs>
        </div>
    );
}

export default EntryEdit;
