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
    Button,
    QuickActionButton,
    TextArea,
    CollapsibleContainer,
} from '@the-deep/deep-ui';
import {
    PartialForm,
    useForm,
    useFormArray,
} from '@togglecorp/toggle-form';

import ListView from '#rsu/../v2/View/ListView';
import Pager from '#rscv/Pager';
import FullPageHeader from '#dui/FullPageHeader';
import { breadcrumb } from '#utils/safeCommon';
import BackLink from '#dui/BackLink';
// import LoadingAnimation from '#rscv/LoadingAnimation';
import { processEntryFilters } from '#entities/entries';
import Tabs, { Tab, TabList, TabPanel } from '#dui/Tabs';

import useRequest from '#utils/request';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

import {
    GeoOptions,
    MultiResponse,
    FrameworkFields,
    PillarAnalysisElement,
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
import SourceEntryItem from './SourceEntryItem';
import AnalyticalStatementInput from './AnalyticalStatementInput';
import { schema, defaultFormValues, AnalyticalStatementType } from './schema';
import EntryContext, { EntryFieldsMin } from './context';

import styles from './styles.scss';

// This is an aribitrary number
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

interface PropsFromState {
    pillarId: number;
    projectId: number;
    analysisId: number;

    activeProject: ProjectDetails;
    pillarAnalysis: {
        id: number;
        data: typeof defaultFormValues;
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

    // FIXME: set initial pristine value on form

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(pillarAnalysisFromProps?.data ?? defaultFormValues, schema);

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

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                console.warn('Save', val);
            }
        },
        [onErrorSet, validate],
    );

    const {
        onValueChange: onAnalyticalStatementChange,
        onValueRemove: onAnalyticalStatementRemove,
    } = useFormArray('analyticalStatements', onValueChange);

    const handleAnalyticalStatementAdd = useCallback(
        () => {
            // NOTE: Don't let users add more that certain statements
            if ((value.analyticalStatements?.length ?? 0) >= STATEMENTS_LIMIT) {
                return;
            }

            const uuid = randomString();
            const newAnalyticalStatement: PartialForm<AnalyticalStatementType> = {
                uuid,
                // FIXME: add order
                order: 0,
            };
            onValueChange(
                [...(value.analyticalStatements ?? []), newAnalyticalStatement],
                'analyticalStatements' as const,
            );
        },
        [onValueChange, value.analyticalStatements],
    );

    type AnalyticalStatements = typeof value.analyticalStatements;

    const handleEntryMove = useCallback(
        (entryId: number, statementUuid: string) => {
            onValueChange(
                (oldStatements: AnalyticalStatements) => (
                    produce(oldStatements ?? [], (safeStatements) => {
                        const selectedIndex = safeStatements
                            .findIndex(s => s.uuid === statementUuid);
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


    // const [value, setValue] = useState<string | undefined>();
    const [activeTab, setActiveTab] = useState<TabNames>('entries');

    // FIXME: please use new form
    const [filtersValue, setFiltersValue] = useState<FaramValues>({});
    const [activePage, setActivePage] = useState(1);

    // FIXME: these are useless
    const [entriesCount, setEntriesCount] = useState(0);
    const [entries, setEntries] = useState<EntryFieldsMin[]>([]);

    const [entriesMapping, setEntriesMapping] = useState<Obj<EntryFieldsMin>>({});

    const handleEntryDrop = useCallback(
        (entryId: number) => {
            const entry = entries?.find(item => item.id === entryId);
            if (!entry) {
                console.error('Me no understand how this entry came from', entryId);
                return;
            }
            setEntriesMapping(oldEntriesMapping => ({
                ...oldEntriesMapping,
                [entryId]: entry,
            }));
        },
        [entries],
    );

    const [
        pendingPillarAnalysis,
        pillarAnalysis,
    ] = useRequest<PillarAnalysisElement>({
        url: `server://projects/${projectId}/analysis/${analysisId}/pillars/${pillarId}/`,
        method: 'GET',
        autoTrigger: true,
        onSuccess: (response) => {
            if (isDefined(response)) {
                const newFilters = listToGroupList(
                    response.filters,
                    o => o.key,
                    o => o.id,
                );
                setFiltersValue(newFilters);
            }
        },
        // FIXME: add schema
        // FIXME: add failure
    });

    const [
        pendingFramework,
        framework,
    ] = useRequest<Partial<FrameworkFields>>({
        url: `server://projects/${projectId}/analysis-framework/`,
        method: 'GET',
        query: frameworkQueryFields,
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('pillarAnalysis', 'frameworkTitle'))({ error: errorBody });
        },
        // FIXME: add schema
    });

    const geoOptionsRequestQueryParams = useMemo(() => ({
        project: projectId,
    }), [projectId]);

    const [
        pendingGeoOptions,
        geoOptions,
    ] = useRequest<GeoOptions>({
        url: 'server://geo-options/',
        method: 'GET',
        query: geoOptionsRequestQueryParams,
        schemaName: 'geoOptions',
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('pillarAnalysis', 'geoLabel'))({ error: errorBody });
        },
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
        });
    }, [geoOptions, filtersValue, framework, projectId]);

    const entriesRequestQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
        fields: [
            'id',
            'excerpt',
            'dropped_excerpt',
            'image',
            'entry_type',
            'tabular_field_data',
        ],
    }), [activePage]);

    const [pendingEntries] = useRequest<MultiResponse<EntryFieldsMin>>({
        url: 'server://entries/filter/',
        method: 'POST',
        body: entriesRequestBody,
        query: entriesRequestQuery,
        autoTrigger: true,
        onSuccess: (response) => {
            setEntriesCount(response.count);
            setEntries(response.results);
        },
        autoTriggerDisabled: pendingPillarAnalysis || pendingFramework,
    });

    const [initialEntries] = useState<number[]>(
        () => {
            const es = pillarAnalysisFromProps?.data?.analyticalStatements
                ?.map(statement => (
                    statement.analyticalEntries?.map(entry => entry.entry)
                )).flat().filter(isDefined).flat();
            return es ?? [];
        },
    );

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
            'image',
            'entry_type',
            'tabular_field_data',
        ],
    }), []);


    useRequest<MultiResponse<EntryFieldsMin>>({
        url: 'server://entries/filter/',
        method: 'POST',
        body: analysisEntriesRequestBody,
        query: analysisEntriesRequestQuery,
        autoTrigger: true,
        onSuccess: (response) => {
            setEntriesCount(response.count);
            setEntriesMapping(oldEntriesMappings => ({
                ...oldEntriesMappings,
                ...listToMap(
                    response.results,
                    item => item.id,
                    item => item,
                ),
            }));
        },
    });

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

    const entryCardRendererParams = useCallback((key, data) => ({
        entryId: key,
        excerpt: data.excerpt,
        image: data.image,
        tabularFieldData: data.tabularFieldData,
        type: data.entryType,
        disabled: usedUpEntriesMap[key],
    }), [usedUpEntriesMap]);

    // const pending = pendingPillarAnalysis || pendingGeoOptions || pendingFramework;

    return (
        <div className={styles.pillarAnalysis}>
            <FullPageHeader
                className={styles.header}
                actionsClassName={styles.actions}
                contentClassName={styles.breadcrumb}
                heading={activeProject?.title}
                actions={(
                    <>
                        <Button
                            name={undefined}
                            className={styles.button}
                            variant="primary"
                            disabled={pristine || pendingPillarAnalysis}
                            onClick={handleSubmit}
                        >
                            {_ts('pillarAnalysis', 'saveButtonLabel')}
                        </Button>
                        <BackLink
                            className={styles.button}
                            defaultLink="/"
                        >
                            {_ts('pillarAnalysis', 'closeButtonLabel')}
                        </BackLink>
                    </>
                )}
            >
                {breadcrumb(pillarAnalysis?.analysisTitle, pillarAnalysis?.title ?? '')}
            </FullPageHeader>
            <div className={styles.content}>
                {error?.$internal && (
                    <p>
                        {error.$internal}
                    </p>
                )}
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
                            rows={6}
                            disabled={pendingPillarAnalysis}
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
                            rows={6}
                            disabled={pendingPillarAnalysis}
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
                    >
                        <CollapsibleContainer
                            className={styles.entryListSection}
                            expandButtonClassName={styles.expandEntryListButton}
                            headerIcons={(
                                <TabList className={styles.header}>
                                    <Tab name="entries">
                                        {_ts('pillarAnalysis', 'entriesTabLabel')}
                                    </Tab>
                                    <Tab
                                        name="discarded"
                                        disabled
                                    >
                                        {_ts('pillarAnalysis', 'discardedEntriesTabLabel')}
                                    </Tab>
                                </TabList>
                            )}
                            footerContent={(
                                <Pager
                                    activePage={activePage}
                                    itemsCount={entriesCount}
                                    maxItemsPerPage={maxItemsPerPage}
                                    onPageClick={setActivePage}
                                    showItemsPerPageChange={false}
                                />
                            )}
                        >
                            <TabPanel name="entries">
                                <ListView
                                    data={entries}
                                    keySelector={entryKeySelector}
                                    renderer={SourceEntryItem}
                                    rendererParams={entryCardRendererParams}
                                    pending={pendingEntries}
                                />
                            </TabPanel>
                            <TabPanel name="discarded">
                                {/* NOTE: This is a dummy text */}
                                Discarded entries go here
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
                                    key={analyticalStatement.uuid}
                                    index={index}
                                    value={analyticalStatement}
                                    onChange={onAnalyticalStatementChange}
                                    onRemove={onAnalyticalStatementRemove}
                                    onEntryMove={handleEntryMove}
                                    onEntryDrop={handleEntryDrop}
                                    // eslint-disable-next-line max-len
                                    error={error?.fields?.analyticalStatements?.members?.[analyticalStatement.uuid]}
                                />
                            ))}
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
