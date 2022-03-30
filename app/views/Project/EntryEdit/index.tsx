import React, { useState, useMemo, useCallback, useRef } from 'react';
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
    compareDate,
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
    Message,
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
import LeftPane, { TabOptions } from './LeftPane';
import EntryCommentWrapper from '#components/entryReview/EntryCommentWrapper';

import getSchema, { defaultFormValues, PartialEntryType, PartialFormType, PartialAttributeType } from './schema';
import { Entry, EntryInput as EntryInputType, Framework } from './types';
import styles from './styles.css';

interface VirtualizedEntryListComponent {
    scrollTo: (item: string) => void;
}

export type EntryImagesMap = { [key: string]: Entry['image'] | undefined };

const DELETE_LEN = 100;
const UPDATE_LEN = 100;

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

    const location = useLocation();
    const locationState = location?.state as {
        entryId?: string;
        entryServerId?: string;
        sectionId?: string;
        activePage?: 'primary' | 'secondary' | 'review' | undefined;
    } | undefined;

    const entryIdFromLocation = locationState?.entryId;
    const entryServerIdFromLocation = locationState?.entryServerId;
    const sectionIdFromLocation = locationState?.sectionId;
    const activePageFromLocation = locationState?.activePage;

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

    const shouldFinalizeRef = useRef<boolean | undefined>(undefined);

    const primaryPageListComponentRef = useRef<VirtualizedEntryListComponent | null>(null);
    const secondaryPageListComponentRef = useRef<VirtualizedEntryListComponent | null>(null);

    const primaryPageLeftPaneRef = useRef<
        { setActiveTab: React.Dispatch<React.SetStateAction<TabOptions>> }
    >(null);
    const secondaryPageLeftPaneRef = useRef<
        { setActiveTab: React.Dispatch<React.SetStateAction<TabOptions>> }
    >(null);

    const [selectedEntry, setSelectedEntry] = useState<string | undefined>(undefined);

    // NOTE: Using useCallback because this needs to be called everytime to get
    // new clientId
    const defaultOptionVal = useCallback(
        (): PartialEntryType => ({
            clientId: `auto-${randomString()}`,
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
                    // Set first section or section from location state as active section
                    const firstSection = analysisFrameworkFromResponse.primaryTagging?.[0];
                    const sectionFromLocation = analysisFrameworkFromResponse
                        .primaryTagging?.find((section) => section.id === sectionIdFromLocation);

                    setSelectedSection(
                        sectionFromLocation
                            ? sectionFromLocation.clientId
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

    const staleIdentifiersRef = useRef<string[] | undefined>();
    const deleteIdentifiersRef = useRef<string[] | undefined>();

    const entriesToSaveRef = useRef<{
        deleteIds: NonNullable<BulkUpdateEntriesMutationVariables['deleteIds']>,
        entries: NonNullable<BulkUpdateEntriesMutationVariables['entries']>,
    } | undefined>();
    const entriesResponseRef = useRef<{
        errors: NonNullable<NonNullable<NonNullable<BulkUpdateEntriesMutation['project']>['entryBulk']>['errors']>;
        result: NonNullable<NonNullable<NonNullable<BulkUpdateEntriesMutation['project']>['entryBulk']>['result']>;
        deletedResult: NonNullable<NonNullable<NonNullable<BulkUpdateEntriesMutation['project']>['entryBulk']>['deletedResult']>;
    } | undefined>();

    const [entryImagesMap, setEntryImagesMap] = useState<EntryImagesMap | undefined>();

    const [
        updateLead,
        { loading: leadUpdatePending },
    ] = useMutation<LeadUpdateMutation, LeadUpdateMutationVariables>(
        UPDATE_LEAD,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadUpdate) {
                    shouldFinalizeRef.current = undefined;
                    return;
                }
                const {
                    result,
                    ok,
                } = response.project.leadUpdate;

                if (!ok) {
                    alert.show(
                        shouldFinalizeRef.current
                            ? 'Failed to mark source as tagged!'
                            : 'Failed to update source.',
                        { variant: 'error' },
                    );
                } else {
                    const leadData = removeNull(result);
                    setLeadValue({
                        ...leadData,
                        attachment: leadData?.attachment?.id,
                        leadGroup: leadData?.leadGroup?.id,
                        assignee: leadData?.assignee?.id,
                        source: leadData?.source?.id,
                        authors: leadData?.authors?.map((author) => author.id),
                    });

                    alert.show(
                        shouldFinalizeRef.current
                            ? 'Successfully marked source as tagged!'
                            : 'Successfully updated source.',
                        { variant: 'success' },
                    );
                }
                shouldFinalizeRef.current = undefined;
            },
            onError: () => {
                alert.show(
                    shouldFinalizeRef.current
                        ? 'Failed to mark source as tagged!'
                        : 'Failed to update source!',
                    { variant: 'error' },
                );

                shouldFinalizeRef.current = undefined;
            },
        },
    );

    const handleLeadSave = useCallback(() => {
        // NOTE: let's save lead if we are finalizing it
        if (!projectId || (leadPristine && !shouldFinalizeRef.current)) {
            shouldFinalizeRef.current = undefined;
            return;
        }
        const submit = createSubmitHandler(
            leadFormValidate,
            (err) => {
                setLeadError(err);
                if (err) {
                    shouldFinalizeRef.current = undefined;
                }
            },
            (val) => {
                const data = val as LeadInputType;
                updateLead({
                    variables: {
                        data: {
                            ...data,
                            status: shouldFinalizeRef.current
                                ? 'TAGGED'
                                : undefined,
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

    // NOTE: handling bulkUpdateEntriesPending because we are making another
    // request after one completes
    // This avoids loading flickers
    const [bulkUpdateEntriesPending, setBulkUpdateEntriesPending] = useState(false);
    const [
        bulkUpdateEntries,
    ] = useMutation<BulkUpdateEntriesMutation, BulkUpdateEntriesMutationVariables>(
        BULK_UPDATE_ENTRIES,
        {
            /*
            update: (cache, response) => {
                const bulkActions = response?.data?.project?.entryBulk;
                if (bulkActions && leadId) {
                    const errors = bulkActions.errors?.filter(isDefined) ?? [];
                    const deletedResult = bulkActions.deletedResult?.filter(isDefined) ?? [];
                    const result = bulkActions.result?.filter(isDefined) ?? [];
                    if (errors.length <= 0 && result.length + deletedResult.length > 0) {
                        console.warn('called');
                        cache.writeFragment({
                            data: {
                                __typename: 'LeadDetailType',
                                id: leadId,
                                status: null,
                            },
                            fragment: gql`
                                fragment NewLeadType on LeadDetailType {
                                    __typename
                                    id
                                    status
                                }
                            `,
                        });
                    }
                }
            },
            */
            onCompleted: (response) => {
                const entryBulk = response.project?.entryBulk;
                if (!entryBulk) {
                    shouldFinalizeRef.current = undefined;
                    entriesToSaveRef.current = undefined;
                    setBulkUpdateEntriesPending(false);
                    return;
                }

                if (!entriesToSaveRef.current) {
                    // NOTE: this case should never occur
                    // eslint-disable-next-line no-console
                    console.error('entriesToSaveRef should always be defined');
                    setBulkUpdateEntriesPending(false);
                    return;
                }

                if (entriesResponseRef.current) {
                    entriesResponseRef.current.errors.push(...(
                        entryBulk.errors ?? []
                    ));
                    entriesResponseRef.current.result.push(...(
                        entryBulk.result ?? []
                    ));
                    entriesResponseRef.current.deletedResult.push(...(
                        entryBulk.deletedResult ?? []
                    ));
                } else {
                    entriesResponseRef.current = {
                        errors: entryBulk.errors ?? [],
                        result: entryBulk.result ?? [],
                        deletedResult: entryBulk.deletedResult ?? [],
                    };
                }

                const nextDeleteIds = entriesToSaveRef.current.deleteIds.slice(
                    entriesResponseRef.current.deletedResult.length,
                    entriesResponseRef.current.deletedResult.length + DELETE_LEN,
                );
                const nextEntryIds = entriesToSaveRef.current.entries.slice(
                    entriesResponseRef.current.result.length,
                    entriesResponseRef.current.result.length + UPDATE_LEN,
                );

                if (nextDeleteIds.length > 0 || nextEntryIds.length > 0) {
                    if (!projectId) {
                        // NOTE: projectId should always be defined here
                        // eslint-disable-next-line no-console
                        console.error('No project id');
                    } else {
                        // setting this to true just in case
                        setBulkUpdateEntriesPending(true);
                        bulkUpdateEntries({
                            variables: {
                                projectId,
                                deleteIds: nextDeleteIds,
                                entries: nextEntryIds,
                            },
                        });
                    }
                    return;
                }

                const {
                    errors,
                    deletedResult,
                    result: saveResult,
                } = entriesResponseRef.current;

                const staleIdentifiers = staleIdentifiersRef.current;
                const deleteIdentifiers = deleteIdentifiersRef.current;

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

                const deletedEntries = deletedResult.map((item, index) => {
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

                const deleteErrorsCount = deletedResult.filter(isNotDefined).length;
                if (deleteErrorsCount > 0) {
                    alert.show(
                        `Failed to delete ${deleteErrorsCount} entries!`,
                        { variant: 'error' },
                    );
                }
                const deleteSuccessCount = deletedResult.filter(isDefined).length;
                if (deleteSuccessCount > 0) {
                    alert.show(
                        `Successfully deleted ${deleteSuccessCount} entry(s)!`,
                        { variant: 'success' },
                    );
                }

                const saveErrorsCount = saveResult?.filter(isNotDefined).length;
                if (saveErrorsCount > 0) {
                    alert.show(
                        `Failed to save ${saveErrorsCount} entry(s)!`,
                        { variant: 'error' },
                    );
                }
                const saveSuccessCount = saveResult?.filter(isDefined).length;
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

                if (saveErrorsCount <= 0 && deleteErrorsCount <= 0) {
                    handleLeadSave();
                } else {
                    shouldFinalizeRef.current = undefined;
                }

                staleIdentifiersRef.current = undefined;
                deleteIdentifiersRef.current = undefined;
                entriesToSaveRef.current = undefined;
                entriesResponseRef.current = undefined;
                setBulkUpdateEntriesPending(false);
            },
            onError: (gqlError) => {
                // NOTE: not retrying/continuing if there is ApolloError
                alert.show(
                    'Failed to save entries!',
                    { variant: 'error' },
                );
                // eslint-disable-next-line no-console
                console.error(gqlError);

                shouldFinalizeRef.current = undefined;

                staleIdentifiersRef.current = undefined;
                deleteIdentifiersRef.current = undefined;
                entriesToSaveRef.current = undefined;
                entriesResponseRef.current = undefined;
                setBulkUpdateEntriesPending(false);
            },
        },
    );

    const handleEntriesSave = useCallback(
        () => {
            if (!projectId) {
                // eslint-disable-next-line no-console
                console.error('No project id');
                shouldFinalizeRef.current = undefined;
                return;
            }

            const submit = createSubmitHandler(
                formValidate,
                (err) => {
                    setFormError(err);
                    if (err) {
                        shouldFinalizeRef.current = undefined;
                    }
                },
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
                    staleIdentifiersRef.current = staleIds;
                    deleteIdentifiersRef.current = deleteIds;

                    // NOTE: deleting all the entries that are not saved on server
                    setFormValue((oldValue) => ({
                        entries: oldValue.entries?.filter(
                            (entry) => entry.id || !entry.deleted,
                        ),
                    }));

                    // NOTE: let's try to save lead if entries is all good
                    if (deletedEntries.length <= 0 && staleEntries.length <= 0) {
                        handleLeadSave();
                        return;
                    }

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

                    entriesToSaveRef.current = {
                        deleteIds: entryDeleteIds,
                        entries: transformedEntries,
                    };

                    const entriesToSave = entriesToSaveRef.current;

                    setBulkUpdateEntriesPending(true);
                    bulkUpdateEntries({
                        variables: {
                            projectId,
                            deleteIds: entriesToSave.deleteIds.slice(
                                0,
                                DELETE_LEN,
                            ),
                            entries: entriesToSave.entries.slice(
                                0,
                                UPDATE_LEN,
                            ),
                        },
                    });
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
            setFormValue,
            allWidgets,
        ],
    );

    const handleSaveClick = useCallback(
        () => {
            shouldFinalizeRef.current = false;
            handleEntriesSave();
        },
        [handleEntriesSave],
    );

    const handleFinalizeClick = useCallback(
        () => {
            shouldFinalizeRef.current = true;
            handleEntriesSave();
        },
        [handleEntriesSave],
    );

    const handleEntryClick = useCallback((entryId: string) => {
        createRestorePoint();
        setSelectedEntry(entryId);
    }, [createRestorePoint]);

    // FIXME: check if we need to do this? also memoize this?
    const currentEntryIndex = formValue.entries?.findIndex(
        (entry) => entry.clientId === selectedEntry,
    ) ?? -1;

    // FIXME: check if we need to do this?
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
                ],
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

    // FIXME: check if we need to do this?
    const onEntryFieldChange = useFormObject(
        currentEntryIndex === -1 ? undefined : currentEntryIndex,
        handleEntryChange,
        defaultOptionVal,
    );

    // FIXME: check if we need to do this?
    const handleExcerptChange = useCallback(
        (_: string, excerpt: string | undefined) => {
            onEntryFieldChange(excerpt, 'excerpt');
        },
        [onEntryFieldChange],
    );

    // FIXME: check if we need to do this?
    const handleEntryDelete = useCallback(
        () => {
            // NOTE: add note why we are clearing restore point
            clearRestorePoint();
            onEntryFieldChange(true, 'deleted');
            setSelectedEntry(undefined);
        },
        [onEntryFieldChange, clearRestorePoint],
    );

    // FIXME: check if we need to do this?
    const handleEntryRestore = useCallback(
        () => {
            // NOTE: add note why we are clearing restore point
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
            primaryPageLeftPaneRef?.current?.setActiveTab('entries');
            setTimeout(
                () => {
                    // NOTE: we use setTimeout with zero time so that 'entries'
                    // tab is already mounted before we try to scroll to
                    // selected entry
                    primaryPageListComponentRef?.current?.scrollTo(entryId);
                },
                0,
            );

            setSelectedSection(sectionId);

            window.location.replace('#/primary-tagging');
        } else {
            secondaryPageLeftPaneRef?.current?.setActiveTab('entries');
            setTimeout(
                () => {
                    // NOTE: we use setTimeout with zero time so that 'entries'
                    // tab is already mounted before we try to scroll to
                    // selected entry
                    secondaryPageListComponentRef?.current?.scrollTo(entryId);
                },
                0,
            );

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
                    // FIXME: server sends entries in reverse order
                    // FIXME: use a better way to sort entries
                    const entries = [...(leadFromResponse.entries) ?? []]
                        .sort((foo, bar) => compareDate(
                            new Date(foo.createdAt),
                            new Date(bar.createdAt),
                        ))
                        .map((entry) => transformEntry(entry as Entry));

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
                    const finalEntryIdFromLocation = entryIdFromLocation
                        ?? entries?.find(
                            (e) => e.id === String(entryServerIdFromLocation),
                        )?.clientId;

                    if (finalEntryIdFromLocation) {
                        createRestorePoint();
                        setSelectedEntry(finalEntryIdFromLocation);

                        if (activePageFromLocation === 'primary') {
                            primaryPageLeftPaneRef?.current?.setActiveTab('entries');
                            setTimeout(
                                () => {
                                    // NOTE: we use setTimeout with zero time so that 'entries'
                                    // tab is already mounted before we try to scroll to
                                    // selected entry
                                    primaryPageListComponentRef?.current?.scrollTo(
                                        finalEntryIdFromLocation,
                                    );
                                },
                                0,
                            );
                        } else if (activePageFromLocation === 'secondary') {
                            secondaryPageLeftPaneRef?.current?.setActiveTab('entries');
                            setTimeout(
                                () => {
                                    // NOTE: we use setTimeout with zero time so that 'entries'
                                    // tab is already mounted before we try to scroll to
                                    // selected entry
                                    secondaryPageListComponentRef?.current?.scrollTo(
                                        finalEntryIdFromLocation,
                                    );
                                },
                                0,
                            );
                        }
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

    // FIXME: can't use leadStatus from query because the underlying types are
    // different
    // const leadStatus = data?.project?.lead?.status;
    const leadStatus = leadValue?.status;

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
                    entryId={datum.id}
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
        if (!entriesFormStale && leadStatus === 'TAGGED') {
            return true;
        }

        return false;
    }, [
        selectedEntry,
        entriesFormStale,
        loading,
        leadStatus,
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
                    homeLinkShown
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
                            retainMount="lazy"
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
                            retainMount="eager"
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
                                        activeTabRef={primaryPageLeftPaneRef}
                                        onEntryDelete={handleEntryDelete}
                                        onEntryRestore={handleEntryRestore}
                                        onExcerptChange={handleExcerptChange}
                                        lead={lead}
                                        leadId={leadId}
                                        listComponentRef={primaryPageListComponentRef}
                                        entryImagesMap={entryImagesMap}
                                        isEntrySelectionActive={isEntrySelectionActive}
                                        entriesError={entriesErrorStateMap}
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
                            retainMount="eager"
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
                                        // FIXME: maybe move the entries change inside
                                        onExcerptChange={handleExcerptChange}
                                        onApproveButtonClick={handleEntryChangeApprove}
                                        onDiscardButtonClick={handleEntryChangeDiscard}
                                        lead={lead}
                                        leadId={leadId}
                                        hideSimplifiedPreview
                                        hideOriginalPreview
                                        listComponentRef={secondaryPageListComponentRef}
                                        entryImagesMap={entryImagesMap}
                                        isEntrySelectionActive={isEntrySelectionActive}
                                        entriesError={entriesErrorStateMap}
                                        activeTabRef={secondaryPageLeftPaneRef}
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
                            retainMount="lazy"
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
                                    {(formValue.entries?.length ?? 0) > 0
                                        ? (
                                            <VirtualizedListView
                                                itemHeight={360}
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
                                                        size="large"
                                                    />
                                                )}
                                                emptyMessage="No entries found"
                                                messageIconShown
                                                messageShown
                                            />
                                        ) : (
                                            <div className={styles.noEntriesFound}>
                                                <Message
                                                    icon={(
                                                        <Kraken
                                                            variant="search"
                                                            size="large"
                                                        />
                                                    )}
                                                    message="No entries found."
                                                />
                                            </div>
                                        )}

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
