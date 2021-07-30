import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import produce from 'immer';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    randomString,
    listToMap,
    Obj,
    checkVersion,
} from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import { Dispatch } from 'redux';
import {
    PendingMessage,
    Heading,
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
    getErrorObject,
} from '@togglecorp/toggle-form';

import FullPageHeader from '#newComponents/ui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#newComponents/ui/BackLink';
import { processEntryFilters } from '#entities/entries';
import NonFieldError from '#newComponents/ui/NonFieldError';
import { transformErrorToToggleFormError } from '#rest';

import notify from '#notify';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';
import SortableList from '#newComponents/ui/SortableList';

import {
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
import AnalyticalStatementInput, { ENTRIES_LIMIT } from './AnalyticalStatementInput';
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

// This is an aribtrary number
const STATEMENTS_LIMIT = 30;

const analysisEntriesRequestQuery = {
    // NOTE: 30 columns x 50 rows
    limit: STATEMENTS_LIMIT * ENTRIES_LIMIT,
    fields: [
        'id',
        'excerpt',
        'dropped_excerpt',
        'image_details',
        'entry_type',
        'tabular_field_data',
    ],
};

type TabNames = 'entries' | 'discarded';

interface DateValue {
    startDate: string;
    endDate: string;
}

interface TimeValue {
    startTime: string;
    endTime: string;
}

// FIXME: remove this
export interface FaramValues {
    // eslint-disable-next-line
    [key: string]: string | string[] | FaramValues | boolean | undefined | DateValue | TimeValue;
}

const frameworkQueryFields = {
    fields: ['widgets', 'filters', 'id'],
};

const maxItemsPerPage = 25;

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

const statementKeySelector = (d: PartialAnalyticalStatementType) => d.clientId;

interface PropsFromState {
    pillarId: number;
    projectId: number;
    analysisId: number;

    activeProject: ProjectDetails;
    pillarAnalysis: {
        id: number;
        versionId: number;
        data: FormType;
        pristine: boolean;
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

    const initialValue = pillarAnalysisFromProps?.data ?? defaultFormValues;

    const [versionId, setVersionId] = useState(pillarAnalysisFromProps?.versionId);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        setValue,
        validate,
        setError,
    } = useForm(schema, initialValue, pillarAnalysisFromProps?.pristine);

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.analyticalStatements);

    const {
        setValue: onAnalyticalStatementChange,
        removeValue: onAnalyticalStatementRemove,
    } = useFormArray('analyticalStatements', setFieldValue);

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
                versionId,
                data: value,
                pristine,
            });
        },
        [value, versionId, pillarId, setPillarAnalysisData, pristine],
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
                notify.send({
                    type: notify.type.WARNING,
                    title: _ts('pillarAnalysis', 'dataUpdate'),
                    message: _ts('pillarAnalysis', 'dateOverridden'),
                    duration: notify.duration.SLOW,
                });
            }
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
            setVersionId(response.versionId);
            setValue((): FormType => ({
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
        onFailure: (response, ctx) => {
            if (response.value.errors) {
                setError(transformErrorToToggleFormError(schema, ctx, response.value.errors));
            }
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

    const entriesRequestBody = useMemo(() => {
        if (isNotDefined(framework)) {
            return {};
        }

        const otherFilters = {
            project: projectId,
        };

        const processedFilters = processEntryFilters(
            filtersValue,
            framework,
        );

        return ({
            filters: [
                ...processedFilters,
                ...Object.entries(otherFilters),
            ],
            discarded: false,
        });
    }, [filtersValue, framework, projectId]);

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
        url: 'server://discarded-entry-options/',
        failureHeader: _ts('pillarAnalysis', 'entriesTitle'),
    });

    const analysisEntriesRequestBody = useMemo(
        () => ({
            filters: [
                ['entries_id', initialEntries],
            ],
        }),
        [initialEntries],
    );

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
        (entryId: number, statementClientId: string) => {
            setFieldValue(
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
        [setFieldValue],
    );

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                updateAnalysisPillars(val);
            }
        },
        [setError, validate, updateAnalysisPillars],
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

    const analyticalStatementRendererParams = useCallback((
        key: string,
        statement: PartialAnalyticalStatementType,
        index: number,
    ) => ({
        className: styles.analyticalStatement,
        index,
        value: statement,
        onChange: onAnalyticalStatementChange,
        onRemove: onAnalyticalStatementRemove,
        onEntryMove: handleEntryMove,
        onEntryDrop: handleEntryDrop,
        error: arrayError?.[statement?.clientId],
    }), [
        onAnalyticalStatementChange,
        onAnalyticalStatementRemove,
        handleEntryMove,
        handleEntryDrop,
        arrayError,
    ]);

    const onOrderChange = useCallback((
        newValues: PartialAnalyticalStatementType[],
    ) => {
        const orderedValues = newValues.map((v, i) => ({ ...v, order: i }));
        setFieldValue(orderedValues, 'analyticalStatements');
    }, [setFieldValue]);

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
                {pending && <PendingMessage />}
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
                </div>
                <EntriesFilterForm
                    className={styles.entriesFilter}
                    filtersValue={filtersValue}
                    regions={activeProject?.regions}
                    onFiltersValueChange={setFiltersValue}
                    filters={framework?.filters}
                    widgets={framework?.widgets}
                    projectId={projectId}
                    disabled={pendingFramework}
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
                            contentClassName={styles.content}
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
                            <TabPanel
                                name="entries"
                                className={styles.tabPanel}
                            >
                                <ListView
                                    className={styles.entriesList}
                                    data={entriesResponse?.results}
                                    keySelector={entryKeySelector}
                                    renderer={SourceEntryItem}
                                    rendererParams={entryCardRendererParams}
                                    pending={pendingEntries}
                                />
                                <Pager
                                    className={styles.pager}
                                    activePage={activePage}
                                    itemsCount={entriesResponse?.count ?? 0}
                                    maxItemsPerPage={maxItemsPerPage}
                                    onActivePageChange={setActivePage}
                                    itemsPerPageControlHidden
                                    hideInfo
                                />
                            </TabPanel>
                            <TabPanel
                                name="discarded"
                                className={styles.tabPanel}
                            >
                                <DiscardedEntries
                                    className={styles.discardedEntriesContainer}
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
                            <SortableList
                                className={styles.list}
                                name="analyticalStatements"
                                onChange={onOrderChange}
                                data={value.analyticalStatements}
                                keySelector={statementKeySelector}
                                renderer={AnalyticalStatementInput}
                                direction="horizontal"
                                rendererParams={analyticalStatementRendererParams}
                                emptyMessage={null}
                                emptyIcon={null}
                            />
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
                        <Prompt
                            when={!pristine}
                            message={_ts('common', 'youHaveUnsavedChanges')}
                        />
                    </EntryContext.Provider>
                </div>
            </div>
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(
    PillarAnalysis,
);
