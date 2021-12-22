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
    ConfirmButton,
    Button,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    VirtualizedListView,
    Kraken,
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

import { getHiddenWidgetIds, getWidgetVersion } from '#types/newAnalyticalFramework';
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
import {
    CountMap,
    CommentCountContext,
    CommentCountContextInterface,
} from '#components/entryReview/EntryCommentWrapper/CommentContext';
import _ts from '#ts';

import {
    PROJECT_FRAMEWORK,
    BULK_UPDATE_ENTRIES,
    UPDATE_LEAD,
    LEAD_ENTRIES,
} from './queries';

import SourceDetails from './SourceDetails';
import LeftPane from './LeftPane';
import EntryCommentWrapper from '#components/entryReview/EntryCommentWrapper';

import getSchema, { defaultFormValues, PartialEntryType, PartialFormType, PartialAttributeType } from './schema';
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
    ] = useState<CountMap>({});

    const [showAllEntriesTab, setShowAllEntriesTab] = useState(false);

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

    const allWidgets = useMemo(
        () => {
            const widgetsFromPrimary = frameworkDetails?.primaryTagging?.flatMap(
                (item) => (item.widgets ?? []),
            ) ?? [];
            const widgetsFromSecondary = frameworkDetails?.secondaryTagging ?? [];
            return [
                ...widgetsFromPrimary,
                ...widgetsFromSecondary,
            ];
        },
        [frameworkDetails?.primaryTagging, frameworkDetails?.secondaryTagging],
    );

    const schema = useMemo(
        () => {
            const widgetsMapping = listToMap(
                allWidgets,
                (item) => item.id,
                (item) => item,
            );

            return getSchema(widgetsMapping);
        },
        [allWidgets],
    );

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

    const entriesFormStale = useMemo(
        () => (formValue?.entries?.some((entry) => entry.stale) ?? false),
        [formValue?.entries],
    );

    const formPristine = !entriesFormStale && leadPristine;

    const [staleIdentifiers, setStaleIdentifiers] = useState<string[] | undefined>(undefined);
    const [deleteIdentifiers, setDeleteIdentifiers] = useState<string[] | undefined>(undefined);
    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();

    const [
        updateLead,
        { loading: leadUpdatePending },
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
                        isFinalizeClicked ? 'Failed to mark source as tagged!' : 'Failed to update source.',
                        { variant: 'error' },
                    );
                } else {
                    alert.show(
                        isFinalizeClicked ? 'Successfully marked source as tagged!' : 'Successfully updated source.',
                        { variant: 'success' },
                    );
                }
                setIsFinalizeClicked(false);
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
                    'Failed to update source!',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleLeadSave = useCallback((finalized: boolean) => {
        if (!projectId || (!finalized && leadPristine)) {
            return;
        }
        const submit = createSubmitHandler(
            leadFormValidate,
            setLeadError,
            (val) => {
                const data = val as LeadInputType;
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
        { loading: bulkUpdateEntriesPending },
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
                        `Successfully deleted ${deleteSuccessCount} entry(s)!`,
                        { variant: 'success' },
                    );
                }

                const saveErrorsCount = entryBulk?.result?.filter(isNotDefined).length ?? 0;
                if (saveErrorsCount > 0) {
                    alert.show(
                        `Failed to save ${saveErrorsCount} entry(s)!`,
                        { variant: 'error' },
                    );
                }
                const saveSuccessCount = entryBulk?.result?.filter(isDefined).length ?? 0;
                if (saveSuccessCount > 0) {
                    alert.show(
                        `Successfully saved ${saveSuccessCount} entry(s)!`,
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
                            'Source cannot be finalized due to some errors in entries.',
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

                        // FIXME: this is repeated
                        const transformedEntries = staleEntries
                            .map((entry) => {
                                const hiddenWidgetIds = getHiddenWidgetIds(
                                    allWidgets,
                                    entry.attributes ?? [],
                                );

                                return {
                                    ...entry,
                                    deleted: undefined,
                                    stale: undefined,
                                    attributes: entry.attributes
                                        ?.filter((attribute) => isDefined(attribute.data))
                                        .filter((attribute) => !hiddenWidgetIds[attribute.widget])
                                        .map((attribute) => ({
                                            ...attribute,
                                            widgetVersion: attribute.widgetVersion,
                                            widgetType: undefined,
                                        })),
                                };
                            });

                        setIsFinalizeClicked(shouldSetFinalize);
                        bulkUpdateEntries({
                            variables: {
                                projectId,
                                deleteIds: entryDeleteIds,
                                entries: transformedEntries,
                            },
                        });
                    } else {
                        handleLeadSave(shouldSetFinalize);
                        alert.show(
                            'Successfully updated entries!',
                            { variant: 'success' },
                        );
                    }
                },
            );
            submit();
        },
        [
            handleLeadSave,
            setFormError,
            formValidate,
            bulkUpdateEntries,
            projectId,
            alert,
            setFormValue,
            allWidgets,
        ],
    );

    const handleSaveClick = useCallback(
        () => {
            if (!entriesFormStale) {
                handleLeadSave(false);
            } else {
                handleSubmit(false);
            }
        },
        [handleSubmit, handleLeadSave, entriesFormStale],
    );

    const handleFinalizeClick = useCallback(
        () => {
            if (!entriesFormStale) {
                handleLeadSave(true);
            } else {
                handleSubmit(true);
            }
        },
        [handleSubmit, entriesFormStale, handleLeadSave],
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
            const defaultAttributes = allWidgets.map((item) => {
                let attr: PartialAttributeType | undefined;
                const clientId = randomString();
                const widget = item.id;

                if (item.widgetId === 'TEXT' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        widgetVersion: getWidgetVersion(item.widgetId),
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'NUMBER' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        widgetVersion: getWidgetVersion(item.widgetId),
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'DATE' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        widgetVersion: getWidgetVersion(item.widgetId),
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'TIME' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        widgetVersion: getWidgetVersion(item.widgetId),
                        data: {
                            value: item.properties.defaultValue,
                        },
                    };
                } else if (item.widgetId === 'SCALE' && item.properties?.defaultValue) {
                    attr = {
                        clientId,
                        widget,
                        widgetType: item.widgetId,
                        widgetVersion: getWidgetVersion(item.widgetId),
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
                ].reverse(),
                'entries',
            );
            setSelectedEntry(newValue.clientId);
        },
        [
            setFormFieldValue,
            createRestorePoint,
            allWidgets,
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
        setShowAllEntriesTab(true);
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
                        leadFromResponse.entries
                            ?.map((entry) => entry.image)
                            .filter(isDefined),
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

    const handleApplyToAll = useCallback(
        (entryId: string, widgetId: string, applyBelowOnly?: boolean) => {
            setFormFieldValue(
                (prevValue: PartialFormType['entries']) => {
                    if (!prevValue) {
                        // eslint-disable-next-line no-console
                        console.error('No entry found');
                        return prevValue;
                    }
                    const referenceEntryIndex = prevValue.findIndex(
                        (item) => item.clientId === entryId,
                    );
                    if (referenceEntryIndex === -1) {
                        // eslint-disable-next-line no-console
                        console.error('No entry found');
                        return prevValue;
                    }
                    const referenceEntry = prevValue[referenceEntryIndex];
                    const referenceAttribute = referenceEntry.attributes?.find(
                        (item) => item.widget === widgetId,
                    );
                    // iterate over entries,
                    // update stale and inject attributes

                    return prevValue.map((entry, index) => {
                        if (entry.clientId === entryId) {
                            return entry;
                        }
                        if (applyBelowOnly && index <= referenceEntryIndex) {
                            return entry;
                        }

                        const newAttributes = [...(entry.attributes ?? [])];

                        const attributeIndex = newAttributes.findIndex(
                            (attribute) => attribute.widget === widgetId,
                        );

                        if (attributeIndex !== -1) {
                            if (referenceAttribute) {
                                const oldValue = newAttributes[attributeIndex];
                                newAttributes.splice(attributeIndex, 1, {
                                    ...referenceAttribute,
                                    id: oldValue.id,
                                    clientId: oldValue.clientId,
                                });
                            } else {
                                delete newAttributes[attributeIndex];
                            }
                        } else if (referenceAttribute) {
                            newAttributes.push({
                                ...referenceAttribute,
                                id: undefined,
                                clientId: randomString(),
                            });
                        }

                        return {
                            ...entry,
                            stale: true,
                            attributes: newAttributes,
                        };
                    });
                },
                'entries',
            );
        },
        [setFormFieldValue],
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
            onApplyToAll: handleApplyToAll,
            allWidgets,
        }),
        [
            allWidgets,
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
            handleApplyToAll,
        ],
    );

    const lead = data?.project?.lead;
    const loading = frameworkLoading
        || entriesLoading
        || bulkUpdateEntriesPending
        || leadUpdatePending;

    const disableFinalizeButton = useMemo(() => {
        if (loading) {
            return true;
        }

        // NOTE: If any entry is selected, we'll disable the button
        if (selectedEntry) {
            return true;
        }

        if ((formValue.entries?.length ?? 0) < 1) {
            return true;
        }

        // NOTE: If entries form is not edited and lead's status is already tagged
        // we don't need to finalize the lead
        if (!entriesFormStale && leadValue.status === 'TAGGED') {
            return true;
        }

        return false;
    }, [
        selectedEntry,
        entriesFormStale,
        loading,
        leadValue.status,
        formValue.entries,
    ]);

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
                                disabled={formPristine || !!selectedEntry || loading}
                                onClick={handleSaveClick}
                            >
                                Save
                            </Button>
                            <ConfirmButton
                                name={undefined}
                                disabled={disableFinalizeButton}
                                variant="primary"
                                onConfirm={handleFinalizeClick}
                                message="Finalizing the source will mark it as tagged.
                                Are you sure you want to finalize the source and all its entries?"
                            >
                                Finalize
                            </ConfirmButton>
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
                            activeClassName={styles.tabPanel}
                            name="source-details"
                        >
                            {projectId && (
                                <SourceDetails
                                    leadValue={leadValue}
                                    setValue={setLeadValue}
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
                            activeClassName={styles.tabPanel}
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
                                        defaultTab={(entryIdFromState || showAllEntriesTab) ? 'entries' : undefined}
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
                                                    activeClassName={styles.panel}
                                                >
                                                    <Section
                                                        key={selectedEntry}
                                                        allWidgets={allWidgets}
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
                            activeClassName={styles.tabPanel}
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
                                        defaultTab={entryIdFromState ? 'entries' : undefined}
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
                                            key={selectedEntry}
                                            allWidgets={allWidgets}
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
                            activeClassName={styles.tabPanel}
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
                                    contentClassName={styles.reviewContent}
                                >
                                    <VirtualizedListView
                                        itemHeight={360}
                                        borderBetweenItem
                                        buffer={0}
                                        keySelector={entryKeySelector}
                                        renderer={EntryInput}
                                        data={formValue.entries}
                                        direction="vertical"
                                        spacing="comfortable"
                                        rendererParams={entryDataRendererParams}
                                        filtered={false}
                                        errored={false}
                                        pending={false}
                                        emptyIcon={(
                                            <Kraken
                                                variant="search"
                                            />
                                        )}
                                        emptyMessage="No entries found"
                                        messageIconShown
                                        messageShown
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
