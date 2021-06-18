import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import produce from 'immer';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    randomString,
    listToMap,
    Obj,
} from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import { Dispatch } from 'redux';
import {
    Heading,
    DropContainer,
    Button,
    QuickActionButton,
    TextArea,
    CollapsibleContainer,
    Tabs,
    Tab,
    TabList,
    TabPanel,
    ListView,
    Pager,
} from '@the-deep/deep-ui';
import {
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import FullPageHeader from '#dui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { processEntryFilters } from '#entities/entries';
import NonFieldError from '#components/ui/NonFieldError';

import notify from '#notify';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';

import {
    GeoOptions,
    MultiResponse,
    FrameworkFields,
    AnalysisPillars,
    ProjectDetails,
    AppState,
} from '#typings';

import {
    projectIdFromRouteSelector,
    analysisIdFromRouteSelector,
    pillarAnalysisIdFromRouteSelector,
    activeProjectFromStateSelector,
    editPillarAnalysisPillarAnalysisSelector,
    setPillarAnalysisDataAction,
} from '#redux';
import EntriesFilterForm from './EntriesFilterForm';
import DiscardedEntries from './DiscardedEntries';
import SourceEntryItem from './SourceEntryItem';
import AnalyticalStatementInput from './AnalyticalStatementInput';
import {
    schema,
    defaultFormValues,
    PartialAnalyticalStatementType,
} from './schema';
import EntryContext, { EntryFieldsMin } from './context';

import styles from './styles.scss';

export interface DiscardedTags {
    key: number;
    value: string;
}

const fakeTags: DiscardedTags[] = [
    {
        key: 0,
        value: 'Redundant',
    },
    {
        key: 1,
        value: 'Too old',
    },
    {
        key: 2,
        value: 'Anecdotal',
    },
    {
        key: 3,
        value: 'Outlier',
    },
];

// This is an aribtrary number
const STATEMENTS_LIMIT = 30;

type TabNames = 'entries' | 'discarded';

// FIXME: remove this
export interface FaramValues {
    [key: string]: string | string[] | FaramValues;
}

const frameworkQueryFields = {
    fields: ['widgets', 'filters', 'id'],
};

const maxItemsPerPage = 5;

const entryKeySelector = (d: EntryFieldsMin) => d.id;

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

type FormType = typeof defaultFormValues;

interface PropsFromState {
    pillarId: number;
    projectId: number;
    analysisId: number;

    activeProject: ProjectDetails;
    pillarAnalysis: {
        id: number;
        data: FormType;
    } | undefined;
}

interface PageProps {
}
type Props = PageProps & PropsFromState & PropsFromDispatch;

function PillarAnalysis(props: Props) {
    const {
        pillarId,
        analysisId,
        projectId,
        activeProject,
        pillarAnalysis: pillarAnalysisFromProps,
        setPillarAnalysisData,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        onValueSet,
        validate,
        onErrorSet,
    } = useForm(
        pillarAnalysisFromProps?.data ?? defaultFormValues,
        schema,
    );

    const [statementDraggedStatus, setStatementDraggedStatus] = useState(false);

    const {
        onValueChange: onAnalyticalStatementChange,
        onValueRemove: onAnalyticalStatementRemove,
    } = useFormArray('analyticalStatements', onValueChange);

    const [activeTab, setActiveTab] = useState<TabNames>('entries');

    // FIXME: please use new form
    const [filtersValue, setFiltersValue] = useState<FaramValues>({});
    const [activePage, setActivePage] = useState(1);

    // NOTE: retain entries mapping to show entry information in entry cards
    const [entriesMapping, setEntriesMapping] = useState<Obj<EntryFieldsMin>>({});

    // NOTE: create a list of entries to fetch data for these on initial load
    const [initialEntries] = useState<number[]>(
        () => {
            const es = pillarAnalysisFromProps?.data?.analyticalStatements
                ?.map(statement => (
                    statement.analyticalEntries?.map(entry => entry.entry)
                )).flat().filter(isDefined).flat();
            return es ?? [];
        },
    );

    const usedUpEntriesMap = useMemo(
        () => {
            const usedUpEntries = value.analyticalStatements?.map(
                statement => statement.analyticalEntries?.map(
                    entry => entry.entry,
                ),
            ).flat().filter(isDefined);
            return listToMap(
                usedUpEntries,
                item => item,
                () => true,
            );
        },
        [value.analyticalStatements],
    );

    // NOTE: write analysis data on redux
    useEffect(
        () => {
            setPillarAnalysisData({
                id: pillarId,
                data: value,
                pristine,
            });
        },
        [value, pillarId, setPillarAnalysisData, pristine],
    );

    const {
        pending: pendingPillarAnalysis,
        response: pillarAnalysis,
    } = useRequest<AnalysisPillars>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        onSuccess: (response) => {
            const newFilters = listToGroupList(
                response.filters,
                o => o.key,
                o => o.id,
            );
            setFiltersValue(newFilters);

            // FIXME: check set pristine value
            // FIXME: only set after checking version id
            onValueSet((): FormType => ({
                mainStatement: response.mainStatement,
                informationGap: response.informationGap,
                analyticalStatements: response.analyticalStatements,
            }));
        },
        failureHeader: _ts('pillarAnalysis', 'pillarAnalysisTitle'),
    });

    const {
        pending: pendingPillarAnalysisSave,
        trigger: updateAnalysisPillars,
    } = useLazyRequest<AnalysisPillars, unknown>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        body: ctx => ctx,
        method: 'PATCH',
        onSuccess: (response) => {
            onValueSet((): FormType => ({
                mainStatement: response.mainStatement,
                informationGap: response.informationGap,
                analyticalStatements: response.analyticalStatements,
            }));
            notify.send({
                title: _ts('pillarAnalysis', 'pillarAnalysisTitle'),
                type: notify.type.SUCCESS,
                message: _ts('pillarAnalysis', 'pillarAnalysisUpdateSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        failureHeader: _ts('pillarAnalysis', 'pillarAnalysisTitle'),
    });

    const {
        pending: pendingFramework,
        response: framework,
    } = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        failureHeader: _ts('pillarAnalysis', 'frameworkTitle'),
    });

    const geoOptionsRequestQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const {
        pending: pendingGeoOptions,
        response: geoOptions,
    } = useRequest<GeoOptions>({
        url: 'server://geo-options/',
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        failureHeader: _ts('pillarAnalysis', 'geoLabel'),
    });

    const entriesRequestBody = useMemo(() => {
        if (isNotDefined(framework) || isNotDefined(geoOptions)) {
            return {};
        }

        const otherFilters = {
            project: projectId,
        };

        const processedFilters = processEntryFilters(
            filtersValue,
            framework,
            geoOptions,
        );

        return ({
            filters: [
                ...processedFilters,
                ...Object.entries(otherFilters),
            ],
            discarded: false,
        });
    }, [geoOptions, filtersValue, framework, projectId]);

    const entriesRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        fields: [
            'id',
            'excerpt',
            'dropped_excerpt',
            'image_details',
            'entry_type',
            'tabular_field_data',
            'created_at',
        ],
    }), [activePage]);

    const {
        pending: pendingEntries,
        response: entriesResponse,
        retrigger: reTriggerEntriesList,
    } = useRequest<MultiResponse<EntryFieldsMin>>({
        url: `server://analysis-pillar/${pillarId}/entries/`,
        method: 'POST',
        skip: pendingPillarAnalysis || pendingFramework,
        body: entriesRequestBody,
        query: entriesRequestQuery,
        failureHeader: _ts('pillarAnalysis', 'entriesTitle'),
        preserveResponse: true,
    });

    const {
        pending: pendingDiscardedTags,
        response: discardedTags,
    } = useRequest<DiscardedTags[]>({
        skip: !pendingEntries,
        url: 'server://discarded-entry-options/',
        query: entriesRequestQuery,
        failureHeader: _ts('pillarAnalysis', 'entriesTitle'),
        // FIXME: Remove this response later on
        mockResponse: fakeTags,
    });

    const analysisEntriesRequestBody = useMemo(
        () => ({
            filters: [
                ['entries_id', initialEntries],
            ],
        }),
        [initialEntries],
    );

    const analysisEntriesRequestQuery = useMemo(() => ({
        // NOTE: 30 columns x 50 rows
        limit: 30 * 50,
        fields: [
            'id',
            'excerpt',
            'dropped_excerpt',
            'image_details',
            'entry_type',
            'tabular_field_data',
        ],
    }), []);

    const {
        pending: pendingEntriesInitialData,
    } = useRequest<MultiResponse<EntryFieldsMin>>({
        url: `server://analysis-pillar/${pillarId}/entries/`,
        method: 'POST',
        body: analysisEntriesRequestBody,
        query: analysisEntriesRequestQuery,
        onSuccess: (response) => {
            setEntriesMapping(oldEntriesMappings => ({
                ...oldEntriesMappings,
                ...listToMap(
                    response.results,
                    item => item.id,
                    item => item,
                ),
            }));
        },
        failureHeader: _ts('pillarAnalysis', 'analysisPillarEntriesTitle'),
    });

    const handleEntryDrop = useCallback(
        (entryId: number) => {
            const entry = entriesResponse?.results?.find(item => item.id === entryId);
            if (!entry) {
                console.error('Me no understand how this entry came from', entryId);
                return;
            }
            setEntriesMapping(oldEntriesMapping => ({
                ...oldEntriesMapping,
                [entryId]: entry,
            }));
        },
        [entriesResponse?.results],
    );

    const handleAnalyticalStatementDrop = useCallback((droppedId: string, dropOverId?: string) => {
        onValueChange((oldStatements: FormType['analyticalStatements']) => {
            if (isNotDefined(oldStatements)) {
                return oldStatements;
            }
            const movedItemIndex = oldStatements.findIndex(item => item.clientId === droppedId);
            if (
                isNotDefined(movedItemIndex)
                || movedItemIndex === -1
            ) {
                return oldStatements;
            }
            const newStatements = [...oldStatements];
            newStatements.splice(movedItemIndex, 1);

            const dropOverIndex = newStatements.findIndex(item => item.clientId === dropOverId);
            if (dropOverIndex === -1) {
                newStatements.push(oldStatements[movedItemIndex]);
            } else {
                newStatements.splice(dropOverIndex, 0, oldStatements[movedItemIndex]);
            }

            // NOTE: After the newly added statements's order is set and
            // placed in the desired index, we can change the order of
            // whole list in bulk
            return newStatements.map((v, i) => ({ ...v, order: i }));
        }, 'analyticalStatements');
    }, [onValueChange]);

    const handleAnalyticalStatementEndDrop = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { statementClientId: string };
            handleAnalyticalStatementDrop(typedVal.statementClientId);
        },
        [handleAnalyticalStatementDrop],
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
                order: oldStatements.length,
            };
            onValueChange(
                [...oldStatements, newAnalyticalStatement],
                'analyticalStatements' as const,
            );
        },
        [onValueChange, value.analyticalStatements],
    );

    type AnalyticalStatements = typeof value.analyticalStatements;

    const handleEntryMove = useCallback(
        (entryId: number, statementClientId: string) => {
            onValueChange(
                (oldStatements: AnalyticalStatements) => (
                    produce(oldStatements ?? [], (safeStatements) => {
                        const selectedIndex = safeStatements
                            .findIndex(s => s.clientId === statementClientId);
                        if (selectedIndex !== -1) {
                            const safeEntries = safeStatements[selectedIndex].analyticalEntries;
                            const entryIndex = safeEntries?.findIndex(s => s.entry === entryId);

                            if (isDefined(entryIndex) && entryIndex !== -1) {
                                safeEntries?.splice(entryIndex, 1);
                            }
                        }
                    })
                ),
                'analyticalStatements' as const,
            );
        },
        [onValueChange],
    );

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                updateAnalysisPillars(val);
            }
        },
        [onErrorSet, validate, updateAnalysisPillars],
    );

    const entryCardRendererParams = useCallback((key: number, data: EntryFieldsMin) => ({
        entryId: key,
        excerpt: data.excerpt,
        createdAt: data.createdAt,
        imageDetails: data.imageDetails,
        tabularFieldData: data.tabularFieldData,
        type: data.entryType,
        disabled: usedUpEntriesMap[key],
        pillarId,
        pillarModifiedDate: pillarAnalysis?.modifiedAt,
        discardedTags,
        onEntryDiscard: reTriggerEntriesList,
    }), [
        usedUpEntriesMap,
        pillarId,
        reTriggerEntriesList,
        discardedTags,
        pillarAnalysis?.modifiedAt,
    ]);

    const pending = pendingPillarAnalysis
    || pendingEntriesInitialData
    || pendingPillarAnalysisSave
    || pendingDiscardedTags;

    return (
        <div className={styles.pillarAnalysis}>
            <FullPageHeader
                className={styles.header}
                actionsClassName={styles.actions}
                contentClassName={styles.breadcrumb}
                heading={activeProject?.title}
                actions={(
                    <>
                        <BackLink
                            className={styles.button}
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                        <Button
                            name={undefined}
                            className={styles.button}
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
                {breadcrumb(pillarAnalysis?.analysisTitle, pillarAnalysis?.title ?? '')}
            </FullPageHeader>
            <div className={styles.content}>
                {pending && <LoadingAnimation />}
                <NonFieldError error={error} />
                <div className={styles.inputsContainer}>
                    <div className={styles.inputContainer}>
                        <Heading
                            className={styles.inputHeader}
                        >
                            {_ts('pillarAnalysis', 'mainStatementLabel')}
                        </Heading>
                        <TextArea
                            name="mainStatement"
                            onChange={onValueChange}
                            value={value.mainStatement}
                            error={error?.fields?.mainStatement}
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
                            onChange={onValueChange}
                            error={error?.fields?.informationGap}
                            rows={4}
                            disabled={pending}
                        />
                    </div>
                </div>
                <EntriesFilterForm
                    className={styles.entriesFilter}
                    filtersValue={filtersValue}
                    geoOptions={geoOptions}
                    regions={activeProject?.regions}
                    onFiltersValueChange={setFiltersValue}
                    filters={framework?.filters}
                    widgets={framework?.widgets}
                    projectId={projectId}
                    disabled={pendingFramework || pendingGeoOptions}
                />
                <div className={styles.workspace}>
                    <Tabs
                        value={activeTab}
                        onChange={setActiveTab}
                        variant="secondary"
                    >
                        <CollapsibleContainer
                            className={styles.entryListSection}
                            expandButtonClassName={styles.expandEntryListButton}
                            headerClassName={styles.entryListHeader}
                            headingClassName={styles.tabListHeading}
                            headingSize="small"
                            heading={(
                                <TabList className={styles.tabList}>
                                    <Tab name="entries">
                                        {_ts(
                                            'pillarAnalysis',
                                            'entriesTabLabel',
                                            { entriesCount: entriesResponse?.count },
                                        )}
                                    </Tab>
                                    <Tab name="discarded">
                                        {_ts('pillarAnalysis', 'discardedEntriesTabLabel')}
                                    </Tab>
                                </TabList>
                            )}
                        >
                            <TabPanel name="entries">
                                <ListView
                                    data={entriesResponse?.results}
                                    keySelector={entryKeySelector}
                                    renderer={SourceEntryItem}
                                    rendererParams={entryCardRendererParams}
                                    pending={pendingEntries}
                                />
                                <Pager
                                    activePage={activePage}
                                    itemsCount={entriesResponse?.count ?? 0}
                                    maxItemsPerPage={maxItemsPerPage}
                                    onActivePageChange={setActivePage}
                                    itemsPerPageControlHidden
                                    hideInfo
                                />
                            </TabPanel>
                            <TabPanel name="discarded">
                                <DiscardedEntries
                                    pillarId={pillarId}
                                    discardedTags={discardedTags}
                                />
                            </TabPanel>
                        </CollapsibleContainer>
                    </Tabs>
                    <EntryContext.Provider
                        value={{
                            entries: entriesMapping,
                            setEntries: setEntriesMapping,
                        }}
                    >
                        <div className={styles.rightContainer}>
                            {value.analyticalStatements?.map((analyticalStatement, index) => (
                                <AnalyticalStatementInput
                                    className={styles.analyticalStatement}
                                    key={analyticalStatement.clientId}
                                    index={index}
                                    value={analyticalStatement}
                                    onChange={onAnalyticalStatementChange}
                                    onRemove={onAnalyticalStatementRemove}
                                    onEntryMove={handleEntryMove}
                                    onEntryDrop={handleEntryDrop}
                                    // eslint-disable-next-line max-len
                                    error={error?.fields?.analyticalStatements?.members?.[analyticalStatement.clientId]}
                                    onStatementDraggedStatusChange={setStatementDraggedStatus}
                                    statementDraggedStatus={statementDraggedStatus}
                                    onAnalyticalStatementDrop={handleAnalyticalStatementDrop}
                                />
                            ))}
                            {statementDraggedStatus && (
                                <DropContainer
                                    className={styles.dropContainer}
                                    name="statement"
                                    // NOTE: Disabled drop on the same entry which is being dragged
                                    onDrop={handleAnalyticalStatementEndDrop}
                                    dropOverlayContainerClassName={styles.overlay}
                                    draggedOverClassName={styles.draggedOver}
                                    contentClassName={styles.content}
                                    disabled={!statementDraggedStatus}
                                />
                            )}
                            <QuickActionButton
                                className={styles.addStatementButton}
                                name={undefined}
                                onClick={handleAnalyticalStatementAdd}
                                title={_ts('pillarAnalysis', 'addAnalyticalStatementButtonTitle')}
                                variant="primary"
                                disabled={
                                    (value.analyticalStatements?.length ?? 0) >= STATEMENTS_LIMIT
                                }
                            >
                                <IoAdd />
                            </QuickActionButton>
                        </div>
                    </EntryContext.Provider>
                </div>
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(
    PillarAnalysis,
);
