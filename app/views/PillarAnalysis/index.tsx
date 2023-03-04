import React, { useContext, useCallback, useMemo, useState } from 'react';
import {
    Prompt,
    useParams,
    useLocation,
} from 'react-router-dom';
import produce from 'immer';
import { useQuery, gql } from '@apollo/client';
import {
    _cs,
    unique,
    doesObjectHaveNoData,
    isDefined,
    mapToList,
    isNotDefined,
    listToGroupList,
    randomString,
    listToMap,
    Obj,
    checkVersion,
} from '@togglecorp/fujs';
import {
    IoAdd,
    IoCheckmark,
    IoClose,
    IoFunnel,
    IoChevronUp,
    IoChevronDown,
    IoChevronBackOutline,
} from 'react-icons/io5';
import {
    useBooleanState,
    PendingMessage,
    Heading,
    useAlert,
    Button,
    QuickActionButton,
    TextArea,
    CollapsibleContainer,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ListView,
    Kraken,
    Pager,
} from '@the-deep/deep-ui';
import {
    useForm,
    useFormArray,
    EntriesAsList,
    removeNull,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import {
    breadcrumb,
    isFiltered,
    reorder,
} from '#utils/common';
import ProjectContext from '#base/context/ProjectContext';
import SubNavbar from '#components/SubNavbar';
import { FrameworkFilterType } from '#types/newAnalyticalFramework';
import BackLink from '#components/BackLink';
import NonFieldError from '#components/NonFieldError';
import { transformSourcesFilterToEntriesFilter } from '#components/leadFilters/SourcesFilter/utils';
import SourcesAppliedFilters from '#components/leadFilters/SourcesAppliedFilters';
import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { ProjectMember } from '#components/selections/ProjectMemberMultiSelectInput';
import { BasicOrganization } from '#components/selections/NewOrganizationMultiSelectInput';
import SortableList from '#components/SortableList';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import SourcesFilter, {
    useFilterState,
    getProjectSourcesQueryVariables,
} from '#components/leadFilters/SourcesFilter';
import { transformErrorToToggleFormError } from '#utils/rest';
import { PartialFormType, FormType as FilterFormType } from '#components/leadFilters/SourcesFilter/schema';
import {
    ProjectFilterDetailsQuery,
    ProjectFilterDetailsQueryVariables,
    ProjectEntriesForAnalysisQuery,
    ProjectEntriesForAnalysisQueryVariables,
} from '#generated/types';

import _ts from '#ts';

import {
    MultiResponse,
    AnalysisPillars,
    EntryType,
} from '#types';

/*
import {
    projectIdFromRouteSelector,
    analysisIdFromRouteSelector,
    pillarAnalysisIdFromRouteSelector,
    activeProjectFromStateSelector,
    editPillarAnalysisPillarAnalysisSelector,
    setPillarAnalysisDataAction,
} from '#redux';
*/

import DiscardedEntries from './DiscardedEntries';
import SourceEntryItem, { Props as SourceEntryItemProps } from './SourceEntryItem';
import AnalyticalStatementInput, {
    ENTRIES_LIMIT,
    AnalyticalStatementInputProps,
} from './AnalyticalStatementInput';
import {
    schema,
    defaultFormValues,
    PartialAnalyticalStatementType,
} from './schema';

import EntryContext, { EntryMin } from './context';

import styles from './styles.css';

interface BooleanOption {
    key: 'true' | 'false';
    value: string;
}

const hasEntryOptions: BooleanOption[] = [
    { key: 'true', value: 'Has entry' },
    { key: 'false', value: 'No entries' },
];

const hasAssessmentOptions: BooleanOption[] = [
    { key: 'true', value: 'Assessment completed' },
    { key: 'false', value: 'Assessment not completed' },
];

const PROJECT_FILTER_DETAILS = gql`
    query ProjectFilterDetails($projectId: ID!) {
        project(id: $projectId) {
            id
            analysisFramework {
                id
                filters {
                    id
                    key
                    properties
                    title
                    widgetKey
                    widgetType
                    widgetTypeDisplay
                    filterType
                    filterTypeDisplay
                }
            }
        }
        sourceStatusOptions: __type(name: "LeadStatusEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourcePriorityOptions: __type(name: "LeadPriorityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        sourceConfidentialityOptions: __type(name: "LeadConfidentialityEnum") {
            name
            enumValues {
                name
                description
            }
        }
        organizationTypes {
            results {
                id
                title
            }
        }
        entryTypeOptions: __type(name: "EntryTagTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        staticColumnOptions: __type(name: "ExportExcelSelectedStaticColumnEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

export const PROJECT_ENTRIES_FOR_ANALYSIS = gql`
    query ProjectEntriesForAnalysis(
            $projectId: ID!
            $pillarId: ID!
            $page: Int,
            $pageSize: Int,
            $controlled: Boolean,
            $createdAtGte: DateTime,
            $createdAtLte: DateTime,
            $createdBy: [ID!],
            $entryTypes: [EntryTagTypeEnum!],
            $filterableData: [EntryFilterDataInputType!]
            $leadAssignees: [ID!],
            $leadConfidentialities: [LeadConfidentialityEnum!],
            $leadPriorities: [LeadPriorityEnum!],
            $leadPublishedOnGte: Date,
            $leadPublishedOnLte: Date,
            $leadSourceOrganizations: [ID!],
            $leadAuthorOrganizations: [ID!],
            $leadStatuses: [LeadStatusEnum!],
            $leadAuthoringOrganizationTypes: [ID!],
        ) {
        project(id: $projectId) {
            id
            analysisPillar(id: $pillarId) {
                id
                entries(
                    page: $page,
                    pageSize: $pageSize,
                    controlled: $controlled,
                    createdAtGte: $createdAtGte,
                    createdAtLte: $createdAtLte,
                    createdBy: $createdBy,
                    entryTypes: $entryTypes,
                    filterableData: $filterableData,
                    leadAssignees: $leadAssignees,
                    leadConfidentialities: $leadConfidentialities,
                    leadPriorities: $leadPriorities,
                    leadPublishedOnGte: $leadPublishedOnGte,
                    leadPublishedOnLte: $leadPublishedOnLte,
                    leadStatuses: $leadStatuses,
                    leadAuthoringOrganizationTypes: $leadAuthoringOrganizationTypes,
                    leadSourceOrganizations: $leadSourceOrganizations,
                    leadAuthorOrganizations: $leadAuthorOrganizations,
                ) {
                    totalCount
                    results {
                        clientId
                        id
                        createdAt
                        entryType
                        droppedExcerpt
                        excerpt
                        lead {
                            id
                        }
                        image {
                            id
                            title
                            file {
                                url
                            }
                        }
                    }
                }
            }
        }
    }
`;

export interface DiscardedTags {
    key: number;
    value: string;
}

// This is an aribtrary number
const STATEMENTS_LIMIT = 30;

interface EntryFields {
    id: number;
    excerpt: string;
    droppedExcerpt?: string;
    imageDetails?: {
        id: number;
        file: string;
    };
    entryType: EntryType;
}

const analysisEntriesRequestQuery = {
    // NOTE: 30 columns x 50 rows
    limit: STATEMENTS_LIMIT * ENTRIES_LIMIT,
    fields: [
        'id',
        'excerpt',
        'dropped_excerpt',
        'image_details',
        'entry_type',
    ],
};

type TabNames = 'entries' | 'discarded';

const entryMap = {
    excerpt: 'EXCERPT',
    image: 'IMAGE',
    dataSeries: 'DATA_SERIES',
} as const;

const maxItemsPerPage = 25;

const entryKeySelector = (d: EntryMin) => d.id;

/*
const mapStateToProps = (state: AppState, props: unknown) => ({
    // FIXME: get this from url directly
    pillarId: pillarAnalysisIdFromRouteSelector(state),
    analysisId: analysisIdFromRouteSelector(state),
    projectId: projectIdFromRouteSelector(state),

    // FIXME: get this from request
    activeProject: activeProjectFromStateSelector(state),

    // FIXME: the inferred typing is wrong in this case
    pillarAnalysis: editPillarAnalysisPillarAnalysisSelector(state, props),
});

interface PropsFromDispatch {
    setPillarAnalysisData: typeof setPillarAnalysisDataAction;
}

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setPillarAnalysisData: params => dispatch(setPillarAnalysisDataAction(params)),
});
*/

type FormType = typeof defaultFormValues;

const statementKeySelector = (d: PartialAnalyticalStatementType) => d.clientId;

function PillarAnalysis() {
    const {
        project,
    } = useContext(ProjectContext);
    const {
        projectId,
        pillarAnalysisId: pillarId,
        analysisId,
    } = useParams<{ projectId: string; pillarAnalysisId: string; analysisId: string }>();
    const alert = useAlert();
    // const initialValue = pillarAnalysisFromProps?.data ?? defaultFormValues;
    const initialValue = defaultFormValues;

    // NOTE: Here to mock redux or other state management later on
    const [
        pillarAnalysisFromState,
        setPillarAnalysis,
    ] = useState<AnalysisPillars | undefined>(undefined);

    const [versionId, setVersionId] = useState(pillarAnalysisFromState?.versionId);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setValue,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.analyticalStatements);

    const {
        setValue: onAnalyticalStatementChange,
        removeValue: onAnalyticalStatementRemove,
    } = useFormArray('analyticalStatements', setFieldValue);

    const [activeTab, setActiveTab] = useState<TabNames | undefined>('entries');

    const {
        loading: frameworkGetPending,
        data: frameworkResponse,
    } = useQuery<ProjectFilterDetailsQuery, ProjectFilterDetailsQueryVariables>(
        PROJECT_FILTER_DETAILS,
        {
            variables: {
                projectId,
            },
        },
    );

    const [
        filtersShown,
        showFilter,
        , ,
        toggleShowFilter,
    ] = useBooleanState(false);

    const [
        inputsShown,
        , , ,
        toggleShowInputs,
    ] = useBooleanState(false);

    // NOTE: data actually used to send to server
    const [
        sourcesFilters,
        setSourcesFilters,
    ] = useState<PartialFormType>({});

    const {
        value: sourcesFilterValue,
        setFieldValue: setSourcesFilterFieldValue,
        setValue: setSourcesFilterValue,
        resetValue: clearSourcesFilterValue,
        setError: setFilterError,
        validate: validateFilter,
        pristine: filterPristine,
        setPristine: setFilterPristine,
    } = useFilterState();

    const handleSourcesFiltersValueChange = useCallback(
        (...filterValue: EntriesAsList<PartialFormType>) => {
            // FIXME: let's use a different handler here
            if (!filtersShown) {
                showFilter();
            }
            setSourcesFilterFieldValue(...filterValue);
        },
        [setSourcesFilterFieldValue, showFilter, filtersShown],
    );

    const [activePage, setActivePage] = useState(1);

    const location = useLocation();
    const [
        createdByOptions,
        setCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        assigneeOptions,
        setAssigneeOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();
    const [
        entryCreatedByOptions,
        setEntryCreatedByOptions,
    ] = useState<ProjectMember[] | undefined | null>();
    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>(undefined);

    const statusOptions = frameworkResponse
        ?.sourceStatusOptions?.enumValues;
    const priorityOptions = frameworkResponse
        ?.sourcePriorityOptions?.enumValues;
    const confidentialityOptions = frameworkResponse
        ?.sourceConfidentialityOptions?.enumValues;
    // FIXME: this may be problematic in the future
    const organizationTypeOptions = frameworkResponse
        ?.organizationTypes?.results;
    const entryTypeOptions = frameworkResponse
        ?.entryTypeOptions?.enumValues;
    const frameworkFilters = (frameworkResponse
        ?.project?.analysisFramework?.filters) as (FrameworkFilterType[] | null | undefined);

    const sourcesFilterContextValue = useMemo(() => ({
        createdByOptions,
        setCreatedByOptions,
        assigneeOptions,
        setAssigneeOptions,
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
        entryCreatedByOptions,
        setEntryCreatedByOptions,
        geoAreaOptions,
        setGeoAreaOptions,

        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        hasAssessmentOptions,
        hasEntryOptions,
        entryTypeOptions,
        frameworkFilters,
    }), [
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        entryCreatedByOptions,
        geoAreaOptions,
        statusOptions,
        priorityOptions,
        confidentialityOptions,
        organizationTypeOptions,
        entryTypeOptions,
        frameworkFilters,
    ]);

    const entriesFilter = useMemo(
        () => {
            const transformedFilters = getProjectSourcesQueryVariables(
                sourcesFilters as Omit<FilterFormType, 'projectId'>,
            );
            return transformSourcesFilterToEntriesFilter(transformedFilters);
        },
        [sourcesFilters],
    );

    const variables = useMemo(
        (): ProjectEntriesForAnalysisQueryVariables | undefined => (
            (projectId) ? {
                projectId,
                pillarId,
                page: activePage,
                pageSize: maxItemsPerPage,
                ...entriesFilter,
            } : undefined
        ),
        [projectId, activePage, entriesFilter, pillarId],
    );

    const {
        previousData,
        data: projectEntriesResponse = previousData,
        loading: pendingEntries,
        refetch: getEntries,
    } = useQuery<ProjectEntriesForAnalysisQuery, ProjectEntriesForAnalysisQueryVariables>(
        PROJECT_ENTRIES_FOR_ANALYSIS,
        {
            skip: isNotDefined(variables),
            variables,
        },
    );

    // NOTE: retain entries mapping to show entry information in entry cards
    const [entriesMapping, setEntriesMapping] = useState<Obj<EntryMin>>({});

    // NOTE: write analysis data on redux
    /*
    useEffect(
        () => {
            setPillarAnalysisData({
                id: pillarId,
                versionId,
                data: value,
                pristine,
            });
        },
        [value, versionId, pillarId, setPillarAnalysisData, pristine],
    );
    */

    const {
        pending: pendingEntriesInitialData,
        trigger: fetchUsedEntriesData,
    } = useLazyRequest<MultiResponse<EntryFields>, number[]>({
        url: `server://analysis-pillar/${pillarId}/entries/`,
        method: 'POST',
        body: (ctx) => ({
            filters: [
                ['entries_id', ctx],
            ],
        }),
        query: analysisEntriesRequestQuery,
        onSuccess: (response) => {
            setEntriesMapping((oldEntriesMappings) => ({
                ...oldEntriesMappings,
                ...listToMap(
                    response.results,
                    (item) => item.id,
                    (item) => ({
                        excerpt: item.excerpt,
                        entryType: entryMap[item.entryType],
                        image: item.imageDetails ? ({
                            id: item.imageDetails.id,
                            file: {
                                url: item.imageDetails.file,
                            },
                        }) : undefined,
                    }),
                ),
            }));
        },
    });

    const {
        pending: pendingPillarAnalysis,
    } = useRequest<AnalysisPillars>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        onSuccess: (response) => {
            // FIXME: how to handle PillarFilterItem
            const newFilters = listToGroupList(
                response.filters,
                (o) => o.key,
                (o) => o.id,
            );
            const filtersList = mapToList(
                newFilters,
                (d, k) => ({
                    filterKey: k,
                    valueList: d,
                }),
            );
            setPillarAnalysis(response);
            setSourcesFilterValue({
                entriesFilterData: {
                    filterableData: filtersList,
                },
            });

            // eslint-disable-next-line max-len
            let analyticalStatements: PartialAnalyticalStatementType[] = response.analyticalStatements ?? [];
            if (
                (response.analyticalStatements?.length ?? 0) === 0
                && response.versionId === 1
            ) {
                // NOTE: We are adding 2 analytical statements if the pillar analysis
                // is new and doesn't have any analytical statements
                // by default (happens if its cloned)
                const clientId1 = randomString();
                const clientId2 = randomString();
                const newAnalyticalStatement1: PartialAnalyticalStatementType = {
                    clientId: clientId1,
                    order: 1,
                    includeInReport: false,
                };
                const newAnalyticalStatement2: PartialAnalyticalStatementType = {
                    clientId: clientId2,
                    order: 2,
                    includeInReport: false,
                };
                analyticalStatements = [newAnalyticalStatement1, newAnalyticalStatement2];
            }

            if ((response.analyticalStatements?.length ?? 0) > 0) {
                const entryIds = response.analyticalStatements
                    ?.map((statement) => statement.analyticalEntries)
                    .flat()?.filter(isDefined).map((entry) => entry.entry);

                const entryIdsInState = pillarAnalysisFromState?.analyticalStatements
                    ?.map((statement) => (
                        statement.analyticalEntries?.map((entry) => entry.entry)
                    )).flat().filter(isDefined).flat();

                const allEntryIds = unique(
                    [
                        ...(entryIds ?? []),
                        ...(entryIdsInState ?? []),
                    ],
                    (d) => d,
                );
                fetchUsedEntriesData(allEntryIds);
            }

            const {
                shouldSetValue,
                isValueOverriden,
            } = checkVersion(versionId, response.versionId);

            if (!shouldSetValue) {
                return;
            }
            setVersionId(response.versionId);

            // FIXME: check set pristine value
            // FIXME: only set after checking version id
            setValue((): FormType => ({
                mainStatement: response.mainStatement,
                informationGap: response.informationGap,
                analyticalStatements,
            }));

            // NOTE:
            // sometimes
            // 1. user could just open old document (the cache is set)
            // 2. user doesn't modify anything
            // 3. user returns later and finds there's new data on server
            // 4. we don't need to show notification in this case even if it's overridden
            if (isValueOverriden && !pristine) {
                alert.show(
                    _ts('pillarAnalysis', 'dateOverridden'),
                    {
                        variant: 'info',
                    },
                );
            }
        },
    });

    const {
        pending: pendingPillarAnalysisSave,
        trigger: updateAnalysisPillars,
    } = useLazyRequest<AnalysisPillars, unknown>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        body: (ctx) => ctx,
        method: 'PATCH',
        onSuccess: (response) => {
            setVersionId(response.versionId);
            setValue((): FormType => ({
                mainStatement: response.mainStatement,
                informationGap: response.informationGap,
                analyticalStatements: response.analyticalStatements,
            }));
            alert.show(
                _ts('pillarAnalysis', 'pillarAnalysisUpdateSuccess'),
                {
                    variant: 'success',
                },
            );
        },
        onFailure: (response, ctx) => {
            if (response.value.errors) {
                setError(transformErrorToToggleFormError(schema, ctx, response.value.errors));
            }
        },
        failureMessage: 'Failed to update pillar analysis.',
    });

    const entriesResponse = useMemo(() => (
        removeNull(projectEntriesResponse?.project?.analysisPillar?.entries)
    ), [projectEntriesResponse]);

    const {
        pending: pendingDiscardedTags,
        response: discardedTags,
    } = useRequest<DiscardedTags[]>({
        url: 'server://discarded-entry-options/',
        method: 'GET',
    });

    const handleEntryDrop = useCallback(
        (entryId: string) => {
            const entry = entriesResponse?.results?.find((item) => item.id === entryId);
            if (!entry) {
                // eslint-disable-next-line no-console
                console.error('Me no understand how this entry came from', entryId);
                return;
            }
            setEntriesMapping((oldEntriesMapping) => ({
                ...oldEntriesMapping,
                [entryId]: entry,
            }));
        },
        [entriesResponse?.results],
    );

    const handleAnalyticalStatementAdd = useCallback(
        () => {
            // NOTE: Don't let users add more that certain items
            if ((value.analyticalStatements?.length ?? 0) >= STATEMENTS_LIMIT) {
                return;
            }

            const oldStatements = value.analyticalStatements ?? [];

            const clientId = randomString();
            const newAnalyticalStatement: PartialAnalyticalStatementType = {
                clientId,
                order: oldStatements.length + 1,
                includeInReport: false,
            };
            setFieldValue(
                [...oldStatements, newAnalyticalStatement],
                'analyticalStatements' as const,
            );
        },
        [setFieldValue, value.analyticalStatements],
    );

    type AnalyticalStatements = typeof value.analyticalStatements;

    const handleEntryMove = useCallback(
        (entryId: string, statementClientId: string) => {
            setFieldValue(
                (oldStatements: AnalyticalStatements) => (
                    produce(oldStatements ?? [], (safeStatements) => {
                        const selectedIndex = safeStatements
                            .findIndex((s) => s.clientId === statementClientId);
                        if (selectedIndex !== -1) {
                            const safeEntries = safeStatements[selectedIndex].analyticalEntries;
                            const entryIndex = safeEntries?.findIndex((s) => s.entry === +entryId);

                            if (isDefined(entryIndex) && entryIndex !== -1) {
                                safeEntries?.splice(entryIndex, 1);
                            }
                        }
                    })
                ),
                'analyticalStatements' as const,
            );
        },
        [setFieldValue],
    );

    const handleFilterApply = useCallback(() => {
        const submit = createSubmitHandler(
            validateFilter,
            setFilterError,
            () => {
                setSourcesFilters(sourcesFilterValue);
                setFilterPristine(true);
            },
        );
        submit();
    }, [
        sourcesFilterValue,
        validateFilter,
        setFilterError,
        setSourcesFilters,
        setFilterPristine,
    ]);

    const handleFilterClear = useCallback(() => {
        clearSourcesFilterValue();
        setSourcesFilters({});
        setFilterPristine(true);
    }, [
        clearSourcesFilterValue,
        setFilterPristine,
    ]);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                updateAnalysisPillars,
            );
            submit();
        },
        [setError, validate, updateAnalysisPillars],
    );

    const entryCardRendererParams = useCallback(
        (key: string, data: EntryMin): SourceEntryItemProps => ({
            entryId: key,
            excerpt: data.excerpt,
            image: data.image,
            createdAt: data.createdAt,
            // tabularFieldData: data.tabularFieldData,
            entryType: data.entryType,
            pillarId,
            pillarModifiedDate: pillarAnalysisFromState?.modifiedAt,
            discardedTags,
            onEntryDiscard: getEntries,
        }), [
            pillarId,
            getEntries,
            discardedTags,
            pillarAnalysisFromState?.modifiedAt,
        ],
    );

    const pending = pendingPillarAnalysis
        || pendingEntriesInitialData
        || pendingPillarAnalysisSave
        || pendingDiscardedTags;

    const handleNgramChange = useCallback((val: string | undefined) => {
        setSourcesFilterValue((filterVal) => ({
            ...filterVal,
            search: val,
        }));
    }, [setSourcesFilterValue]);

    const analyticalStatementRendererParams = useCallback((
        _: string,
        statement: PartialAnalyticalStatementType,
        index: number,
    ): AnalyticalStatementInputProps => ({
        className: styles.analyticalStatement,
        index,
        value: statement,
        onChange: onAnalyticalStatementChange,
        onRemove: onAnalyticalStatementRemove,
        onEntryMove: handleEntryMove,
        onEntryDrop: handleEntryDrop,
        onSelectedNgramChange: handleNgramChange,
        error: arrayError?.[statement?.clientId],
    }), [
        handleNgramChange,
        onAnalyticalStatementChange,
        onAnalyticalStatementRemove,
        handleEntryMove,
        handleEntryDrop,
        arrayError,
    ]);

    const onOrderChange = useCallback((
        newValues: PartialAnalyticalStatementType[],
    ) => {
        const orderedValues = reorder(newValues);
        setFieldValue(orderedValues, 'analyticalStatements');
    }, [setFieldValue]);

    const statementsCount = value.analyticalStatements?.length ?? 0;

    const entryContextValue = useMemo(
        () => ({
            entries: entriesMapping,
            setEntries: setEntriesMapping,
        }),
        [entriesMapping, setEntriesMapping],
    );

    const isCurrentFilterEmpty = doesObjectHaveNoData(sourcesFilters, ['', null]);
    const isFilterEmpty = doesObjectHaveNoData(sourcesFilterValue, ['', null]);

    return (
        <div className={styles.pillarAnalysis}>
            <SubNavbar
                className={styles.header}
                heading={project?.title}
                childrenClassName={styles.breadcrumb}
                homeLinkShown
                defaultActions={(
                    <>
                        <BackLink
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                        <Button
                            name={undefined}
                            variant="primary"
                            disabled={
                                pristine || pending
                            }
                            onClick={handleSubmit}
                        >
                            {_ts('pillarAnalysis', 'saveButtonLabel')}
                        </Button>
                    </>
                )}
            >
                {breadcrumb([
                    pillarAnalysisFromState?.analysisTitle,
                    pillarAnalysisFromState?.title ?? '',
                ])}
            </SubNavbar>
            <SourcesFilterContext.Provider value={sourcesFilterContextValue}>
                <div className={styles.content}>
                    {(frameworkGetPending || pending) && <PendingMessage />}
                    <NonFieldError error={error} />
                    <div
                        className={_cs(
                            styles.inputsContainer,
                            inputsShown && styles.inputsShown,
                        )}
                    >
                        {inputsShown && (
                            <>
                                <div className={styles.inputContainer}>
                                    <Heading
                                        className={styles.inputHeader}
                                    >
                                        {_ts('pillarAnalysis', 'mainStatementLabel')}
                                    </Heading>
                                    <TextArea
                                        name="mainStatement"
                                        onChange={setFieldValue}
                                        value={value.mainStatement}
                                        error={error?.mainStatement}
                                        rows={4}
                                        disabled={pending}
                                    />
                                </div>
                                <div className={styles.inputContainer}>
                                    <Heading
                                        className={styles.inputHeader}
                                    >
                                        {_ts('pillarAnalysis', 'infoGapLabel')}
                                    </Heading>
                                    <TextArea
                                        name="informationGap"
                                        value={value.informationGap}
                                        onChange={setFieldValue}
                                        error={error?.informationGap}
                                        rows={4}
                                        disabled={pending}
                                    />
                                </div>
                            </>
                        )}
                        <Button
                            className={styles.showInputsButton}
                            name={undefined}
                            onClick={toggleShowInputs}
                            icons={inputsShown ? <IoChevronUp /> : <IoChevronDown />}
                            variant="transparent"
                        >
                            {inputsShown ? 'Hide' : 'Show Main Statement and Information Gaps'}
                        </Button>
                    </div>
                    <div className={styles.filterContainer}>
                        <Button
                            name={undefined}
                            onClick={toggleShowFilter}
                            spacing="compact"
                            icons={<IoFunnel />}
                        >
                            Filter
                        </Button>
                        {!(isCurrentFilterEmpty && isFilterEmpty) && (
                            <div className={styles.buttons}>
                                <Button
                                    disabled={filterPristine}
                                    name="sourcesFilterSubmit"
                                    spacing="compact"
                                    icons={(
                                        <IoCheckmark />
                                    )}
                                    variant="tertiary"
                                    onClick={handleFilterApply}
                                >
                                    Apply
                                </Button>
                                <Button
                                    disabled={isFilterEmpty}
                                    name="clearFilter"
                                    icons={(
                                        <IoClose />
                                    )}
                                    variant="tertiary"
                                    spacing="compact"
                                    onClick={handleFilterClear}
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}
                        <SourcesAppliedFilters
                            className={styles.appliedFilters}
                            value={sourcesFilterValue}
                            onChange={handleSourcesFiltersValueChange}
                        />
                    </div>
                    <div className={styles.workspace}>
                        {filtersShown && (
                            <SourcesFilter
                                className={styles.entriesFilter}
                                value={sourcesFilterValue}
                                projectId={projectId}
                                onChange={handleSourcesFiltersValueChange}
                                isEntriesOnlyFilter
                                optionsLoading={false}
                                optionsErrored={false}
                            />
                        )}
                        <Tabs
                            value={activeTab}
                            onChange={setActiveTab}
                            variant="secondary"
                        >
                            <CollapsibleContainer
                                className={styles.entryListSection}
                                expandButtonClassName={styles.expandEntryListButton}
                                collapseButtonClassName={styles.collapseEntryListButton}
                                expandButtonContent={(
                                    <div className={styles.buttonText}>
                                        Show Entries
                                        <IoChevronBackOutline />
                                    </div>
                                )}
                                headerClassName={styles.entryListHeader}
                                headingClassName={styles.tabListHeading}
                                headingSize="small"
                                contentClassName={styles.content}
                                heading={(
                                    <TabList className={styles.tabList}>
                                        <Tab
                                            name="entries"
                                            className={styles.tab}
                                        >
                                            {_ts(
                                                'pillarAnalysis',
                                                'entriesTabLabel',
                                                { entriesCount: entriesResponse?.totalCount },
                                            )}
                                        </Tab>
                                        <Tab
                                            name="discarded"
                                            className={styles.tab}
                                        >
                                            {_ts('pillarAnalysis', 'discardedEntriesTabLabel')}
                                        </Tab>
                                    </TabList>
                                )}
                            >
                                <TabPanel
                                    name="entries"
                                    activeClassName={styles.tabPanel}
                                >
                                    <ListView
                                        className={styles.entriesList}
                                        data={entriesResponse?.results}
                                        keySelector={entryKeySelector}
                                        renderer={SourceEntryItem}
                                        rendererParams={entryCardRendererParams}
                                        pending={pendingEntries}
                                        errored={false}
                                        filtered={isFiltered(sourcesFilterValue)}
                                        emptyIcon={(
                                            <Kraken
                                                variant="experiment"
                                            />
                                        )}
                                        emptyMessage="Entries not found."
                                        filteredEmptyMessage="No matching entries were found."
                                        messageIconShown
                                        messageShown
                                    />
                                    <Pager
                                        className={styles.pager}
                                        activePage={activePage}
                                        itemsCount={entriesResponse?.totalCount ?? 0}
                                        maxItemsPerPage={maxItemsPerPage}
                                        onActivePageChange={setActivePage}
                                        itemsPerPageControlHidden
                                    />
                                </TabPanel>
                                <TabPanel
                                    name="discarded"
                                    activeClassName={styles.tabPanel}
                                >
                                    <DiscardedEntries
                                        className={styles.discardedEntriesContainer}
                                        pillarId={+pillarId}
                                        discardedTags={discardedTags}
                                        onUndiscardSuccess={getEntries}
                                    />
                                </TabPanel>
                            </CollapsibleContainer>
                        </Tabs>
                        <EntryContext.Provider
                            value={entryContextValue}
                        >
                            <div className={styles.rightContainer}>
                                <SortableList
                                    className={_cs(
                                        styles.list,
                                        statementsCount < 1 && styles.empty,
                                    )}
                                    name="analyticalStatements"
                                    onChange={onOrderChange}
                                    data={value.analyticalStatements}
                                    keySelector={statementKeySelector}
                                    renderer={AnalyticalStatementInput}
                                    direction="horizontal"
                                    rendererParams={analyticalStatementRendererParams}
                                    messageShown
                                    messageIconShown
                                    emptyMessage="Looks like there aren't any analytical statements in this analysis."
                                    messageActions={(
                                        <Button
                                            className={styles.addStatementButton}
                                            name={undefined}
                                            onClick={handleAnalyticalStatementAdd}
                                            title={_ts('pillarAnalysis', 'addAnalyticalStatementButtonTitle')}
                                            variant="primary"
                                            icons={(<IoAdd />)}
                                        >
                                            Add Analytical Statement
                                        </Button>
                                    )}
                                />
                                {statementsCount > 0 && (
                                    <QuickActionButton
                                        className={styles.addStatementButton}
                                        name={undefined}
                                        onClick={handleAnalyticalStatementAdd}
                                        title={(statementsCount < STATEMENTS_LIMIT
                                            ? _ts('pillarAnalysis', 'addAnalyticalStatementButtonTitle')
                                            : `You cannot add more than ${STATEMENTS_LIMIT} statements.`
                                        )}
                                        variant="primary"
                                        disabled={statementsCount >= STATEMENTS_LIMIT}
                                    >
                                        <IoAdd />
                                    </QuickActionButton>
                                )}
                            </div>
                            <Prompt
                                message={(newLocation) => {
                                    if (newLocation.pathname !== location.pathname && !pristine) {
                                        return _ts('common', 'youHaveUnsavedChanges');
                                    }
                                    return true;
                                }}
                            />
                        </EntryContext.Provider>
                    </div>
                </div>
            </SourcesFilterContext.Provider>
        </div>
    );
}

export default PillarAnalysis;
