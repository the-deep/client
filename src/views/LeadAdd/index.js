import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Prompt } from 'react-router-dom';
import {
    _cs,
    formatDateToString,
    isDefined,
    listToMap,
    reverseRoute,
    compareNumber,
    unique,
} from '@togglecorp/fujs';
import { detachedFaram } from '@togglecorp/faram';

import Button from '#rsca/Button';
import Message from '#rscv/Message';
import Confirm from '#rscv/Modal/Confirm';
import Page from '#rscv/Page';
import ResizableV from '#rscv/Resizable/ResizableV';
import { CoordinatorBuilder } from '#rsu/coordinate';
import { FgRestBuilder } from '#rsu/rest';

import LeadCopyModal from '#components/general/LeadCopyModal';
import { pathNames } from '#constants';
import Cloak from '#components/general/Cloak';
import BackLink from '#components/general/BackLink';

import useRequest from '#restrequest';
import { RequestCoordinator } from '#request';
import {
    routeUrlSelector,
    projectIdFromRouteSelector,
    activeUserSelector,

    leadAddPageLeadsSelector,
    leadAddPageActiveLeadSelector,
    leadAddPageLeadPreviewHiddenSelector,

    leadAddAppendLeadsAction,
    leadAddRemoveLeadsAction,
    leadAddSetLeadAttachmentAction,
    leadAddChangeLeadAction,
    leadAddSaveLeadAction,

    leadAddSetActiveSourceAction,
    leadAddPageActiveSourceSelector,
} from '#redux';
import {
    createUrlForLeadEdit,
    urlForLead,
    createParamsForLeadEdit,
    createParamsForLeadCreate,

    alterResponseErrorToFaramError,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

import LeadListItem from './LeadListItem';
import LeadSources from './LeadSources';
import LeadPreview from './LeadPreview';
import LeadActions from './LeadActions';
import LeadList from './LeadList';
import LeadFilter from './LeadFilter';
import LeadDetail from './LeadDetail';
import LeadProcessor from './LeadProcessor';
import CandidateLeads from './CandidateLeads';
import schema from './LeadDetail/faramSchema';

import {
    LEAD_TYPE,
    getLeadState,
    leadFaramValuesSelector,
    leadIdSelector,
    leadKeySelector,
    leadSourceTypeSelector,
    getNewLeadKey,
} from './utils';
import styles from './styles.scss';

const mockConnectors = {
    count: 1,
    next: null,
    previous: null,
    results: [
        {
            id: 1,
            createdAt: '2020-09-16T09:17:56.999452Z',
            modifiedAt: '2020-09-16T09:19:32.621638Z',
            createdBy: 2,
            modifiedBy: 2,
            createdByName: 'Safar Ligal',
            modifiedByName: 'Safar Ligal',
            clientId: null,
            versionId: 2,
            sources: [
                {
                    id: 6,
                    params: {
                        country: '695',
                        dateFrom: '2020-01-01',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'unhcr-portal',
                    connector: 1,
                },
                {
                    id: 5,
                    params: {
                        from: '2020-01-01',
                        country: 'NPL',
                        'primary-country': 'NPL',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'relief-web',
                    connector: 1,
                },
                {
                    id: 4,
                    params: {
                        country: 'Nepal',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'post-disaster-needs-assessment',
                    connector: 1,
                },
                {
                    id: 3,
                    params: {
                        'nameList[]': 'NP',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'research-resource-center',
                    connector: 1,
                },
                {
                    id: 2,
                    params: {
                        tid1: '260',
                        tid6: 'All',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'world-food-programme',
                    connector: 1,
                },
                {
                    id: 1,
                    params: {
                        country: 'nepal',
                    },
                    lastCalculatedAt: null,
                    stats: {},
                    status: 'processing',
                    source: 'humanitarian-response',
                    connector: 1,
                },
            ],
            title: 'My First Connector',
            project: 1,
        },
    ],
};

const mockLeads = {
    count: 10,
    next: null,
    previous: null,
    results: [
        {
            id: 74,
            lead: {
                id: 44,
                url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/UNHCR%20Asia-Pacific%20COVID-19%20external%20update%2016-09-20%20rev.pdf',
                status: 'success',
                data: {
                    key: '3670998',
                    url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/UNHCR%20Asia-Pacific%20COVID-19%20external%20update%2016-09-20%20rev.pdf',
                    title: 'UNHCR Asia and the Pacific COVID-19 External Update (16 September 2020)',
                    source: 4232,
                    authors: [
                        3369,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'UN High Commissioner for Refugees',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-16 00:00:00+00:00',
                    authorDetail: {
                        id: 3369,
                        title: 'UN High Commissioner for Refugees',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 3369,
                            title: 'UN High Commissioner for Refugees',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 73,
            lead: {
                id: 43,
                url: 'https://reliefweb.int/report/nepal/nepal-earthquake-national-seismological-centre-media-echo-daily-flash-16-september',
                status: 'success',
                data: {
                    key: '3670672',
                    url: 'https://reliefweb.int/report/nepal/nepal-earthquake-national-seismological-centre-media-echo-daily-flash-16-september',
                    title: 'Nepal – Earthquake (National Seismological Centre, Media) (ECHO Daily Flash of 16 September)',
                    source: 4232,
                    authors: [
                        1957,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: "European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations",
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-16 00:00:00+00:00',
                    authorDetail: {
                        id: 1957,
                        title: "ECHO (European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations)",
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 1957,
                            title: "ECHO (European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations)",
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 71,
            lead: {
                id: 41,
                url: 'https://reliefweb.int/report/nepal/nepal-makes-progress-human-capital-development-though-pandemic-threatens-gains-past',
                status: 'success',
                data: {
                    key: '3670885',
                    url: 'https://reliefweb.int/report/nepal/nepal-makes-progress-human-capital-development-though-pandemic-threatens-gains-past',
                    title: 'Nepal makes progress in human capital development though pandemic threatens gains of the past decade',
                    source: 4232,
                    authors: [
                        2984,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'World Bank',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-17 00:00:00+00:00',
                    authorDetail: {
                        id: 2984,
                        title: 'World Bank',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 2984,
                            title: 'World Bank',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 76,
            lead: {
                id: 46,
                url: 'https://reliefweb.int/report/nepal/feature-lessons-pandemic-nepal-learning-transform-its-agricultural-sector',
                status: 'success',
                data: {
                    key: '3670292',
                    url: 'https://reliefweb.int/report/nepal/feature-lessons-pandemic-nepal-learning-transform-its-agricultural-sector',
                    title: 'FEATURE: Lessons from the pandemic – Nepal is learning to transform its agricultural sector',
                    source: 4232,
                    authors: [
                        3922,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'Climate and Development Knowledge Network',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-15 00:00:00+00:00',
                    authorDetail: {
                        id: 3922,
                        title: 'Climate and Development Knowledge Network',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 3922,
                            title: 'Climate and Development Knowledge Network',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 72,
            lead: {
                id: 42,
                url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/roap_covid_response_sitrep_18.pdf',
                status: 'success',
                data: {
                    key: '3670541',
                    url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/roap_covid_response_sitrep_18.pdf',
                    title: 'COVID-19 Response: IOM Regional Office for Asia Pacific Situation Report 18 - September 16, 2020',
                    source: 4232,
                    authors: [
                        3310,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'International Organization for Migration',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-16 00:00:00+00:00',
                    authorDetail: {
                        id: 3310,
                        title: 'International Organization for Migration',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 3310,
                            title: 'International Organization for Migration',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 78,
            lead: {
                id: 48,
                url: 'https://reliefweb.int/report/united-states-america/cws-condemns-tps-termination-which-could-lead-family-separation',
                status: 'success',
                data: {
                    key: '3670141',
                    url: 'https://reliefweb.int/report/united-states-america/cws-condemns-tps-termination-which-could-lead-family-separation',
                    title: 'CWS Condemns TPS Termination, Which Could lead to Family Separation & Deportation of Hundreds of Thousands in the United States',
                    source: 4232,
                    authors: [
                        2041,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'Church World Service',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-14 00:00:00+00:00',
                    authorDetail: {
                        id: 2041,
                        title: 'Church World Service',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 2041,
                            title: 'Church World Service',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 80,
            lead: {
                id: 50,
                url: 'https://reliefweb.int/report/nepal/nepal-landslides-echo-daily-flash-14-september-2020',
                status: 'success',
                data: {
                    key: '3669991',
                    url: 'https://reliefweb.int/report/nepal/nepal-landslides-echo-daily-flash-14-september-2020',
                    title: 'Nepal - Landslides (ECHO Daily Flash of 14 September 2020)',
                    source: 4232,
                    authors: [
                        1957,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: "European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations",
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-14 00:00:00+00:00',
                    authorDetail: {
                        id: 1957,
                        title: "ECHO (European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations)",
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 1957,
                            title: "ECHO (European Commission's Directorate-General for European Civil Protection and Humanitarian Aid Operations)",
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 79,
            lead: {
                id: 49,
                url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/DCA%20COVID-19%20and%20Flood%20Response_SITREP%20%23XXIV_Final%20.pdf',
                status: 'success',
                data: {
                    key: '3670037',
                    url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/DCA%20COVID-19%20and%20Flood%20Response_SITREP%20%23XXIV_Final%20.pdf',
                    title: 'Covid19: Nepal Covid 19 and Flood Response Situation Report No.XXIV, as of 14 September 2020',
                    source: 4232,
                    authors: [
                        2602,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'DanChurchAid',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-14 00:00:00+00:00',
                    authorDetail: {
                        id: 2602,
                        title: 'DanChurchAid',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 2602,
                            title: 'DanChurchAid',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 77,
            lead: {
                id: 47,
                url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/pacific_logistics_cluster_airport_restrictions_information_200915.pdf',
                status: 'success',
                data: {
                    key: '3670180',
                    url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/pacific_logistics_cluster_airport_restrictions_information_200915.pdf',
                    title: 'Pacific - Airport Restrictions Information (Updated 15 September 2020)',
                    source: 4232,
                    authors: [
                        3171,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'World Food Programme',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-15 00:00:00+00:00',
                    authorDetail: {
                        id: 3171,
                        title: 'World Food Programme',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 3171,
                            title: 'World Food Programme',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
        {
            id: 75,
            lead: {
                id: 45,
                url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/ROAP_Snapshot_200915.pdf',
                status: 'success',
                data: {
                    key: '3670318',
                    url: 'https://reliefweb.int/sites/reliefweb.int/files/resources/ROAP_Snapshot_200915.pdf',
                    title: 'Asia and the Pacific: Weekly Regional Humanitarian Snapshot (8 - 14 September 2020)',
                    source: 4232,
                    authors: [
                        4206,
                    ],
                    website: 'www.reliefweb.int',
                    existing: false,
                    authorRaw: 'UN Office for the Coordination of Humanitarian Affairs',
                    sourceRaw: 'reliefweb',
                    sourceType: 'website',
                    emmEntities: [],
                    emmTriggers: [],
                    publishedOn: '2020-09-15 00:00:00+00:00',
                    authorDetail: {
                        id: 4206,
                        title: 'UN Office for the Coordination of Humanitarian Affairs',
                    },
                    sourceDetail: {
                        id: 4232,
                        title: 'ReliefWeb',
                        mergedAs: {
                            id: 3507,
                            title: 'Reliefweb',
                        },
                    },
                    authorsDetail: [
                        {
                            id: 4206,
                            title: 'UN Office for the Coordination of Humanitarian Affairs',
                        },
                    ],
                },
            },
            blocked: false,
            alreadyAdded: false,
        },
    ],
};

function mergeEntities(foo = [], bar = []) {
    return unique(
        [...foo, ...bar],
        item => item.id,
    );
}

const mapStateToProps = state => ({
    routeUrl: routeUrlSelector(state),

    projectId: projectIdFromRouteSelector(state),
    activeUser: activeUserSelector(state),

    leads: leadAddPageLeadsSelector(state),
    activeLead: leadAddPageActiveLeadSelector(state),
    leadPreviewHidden: leadAddPageLeadPreviewHiddenSelector(state),

    activeSource: leadAddPageActiveSourceSelector(state),
});

const mapDispatchToProps = dispatch => ({
    onSourceChange: params => dispatch(leadAddSetActiveSourceAction(params)),
    appendLeads: params => dispatch(leadAddAppendLeadsAction(params)),
    removeLeads: params => dispatch(leadAddRemoveLeadsAction(params)),
    changeLead: params => dispatch(leadAddChangeLeadAction(params)),
    setLeadAttachment: params => dispatch(leadAddSetLeadAttachmentAction(params)),
    saveLead: params => dispatch(leadAddSaveLeadAction(params)),
});

const shouldHideButtons = ({ leadPermissions }) => !leadPermissions.create;

const propTypes = {
    routeUrl: PropTypes.string.isRequired,
    projectId: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    leads: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    activeLead: PropTypes.object,
    leadPreviewHidden: PropTypes.bool,

    appendLeads: PropTypes.func.isRequired,
    removeLeads: PropTypes.func.isRequired,
    changeLead: PropTypes.func.isRequired,
    saveLead: PropTypes.func.isRequired,

    onSourceChange: PropTypes.func.isRequired,
    activeSource: PropTypes.string.isRequired,
};

const defaultProps = {
    projectId: undefined,
    leads: [],
    activeLead: undefined,
    leadPreviewHidden: false,
};

function LeadAdd(props) {
    const {
        activeLead,
        activeUser: { userId },
        appendLeads,
        leadPreviewHidden,
        leads,
        projectId,
        routeUrl,
        changeLead,
        saveLead,
        removeLeads,
        onSourceChange,
        activeSource,
    } = props;

    const [leadSaveStatuses, setLeadSaveStatuses] = useState({});
    const [submitAllPending, setSubmitAllPending] = useState(false);

    const [leadsToExport, setLeadsToExport] = useState([]);
    const [leadsToRemove, setLeadsToRemove] = useState([]);
    const [leadExportModalShown, setLeadExportModalShown] = useState(false);
    const [leadRemoveConfirmShown, setLeadRemoveConfirmShown] = useState(false);

    const [organizations, setOrganizations] = useState([]);
    const [leadGroups, setLeadGroups] = useState([]);

    const mergeOrganizations = useCallback(
        (newOrganizations) => {
            setOrganizations(stateOrganizations => (
                mergeEntities(stateOrganizations, newOrganizations)
            ));
        },
        [],
    );

    const body = useMemo(
        () => {
            const values = leads.map(leadFaramValuesSelector);
            const leadSources = values.map(item => item.source).filter(isDefined);
            const leadAuthors = values.map(item => item.authors).filter(isDefined).flat();
            return {
                projects: [projectId],
                organizations: unique([...leadSources, ...leadAuthors], id => id),
            };
        },
        // NOTE: only re-calculate when project id changes
        [projectId],
    );

    const [pending, leadOptions] = useRequest({
        url: 'server://lead-options/',
        method: 'POST',
        body,
        autoTrigger: true,
        onSuccess: (response) => {
            setOrganizations(response.organizations);
            setLeadGroups(response.leadGroups);
        },
        onFailure: () => {
            setOrganizations([]);
            setLeadGroups([]);
        },
    });

    const formCoordinator = useMemo(
        () => (
            new CoordinatorBuilder()
                .maxActiveActors(3)
                .preSession(() => {
                    setSubmitAllPending(true);
                })
                .postSession((totalErrors) => {
                    setSubmitAllPending(false);

                    if (totalErrors > 0) {
                        notify.send({
                            title: _ts('addLeads', 'leadSave'),
                            type: notify.type.ERROR,
                            message: _ts('addLeads', 'leadSaveFailure', { errorCount: totalErrors }),
                            duration: notify.duration.SLOW,
                        });
                    } else {
                        notify.send({
                            title: _ts('addLeads', 'leadSave'),
                            type: notify.type.SUCCESS,
                            message: _ts('addLeads', 'leadSaveSuccess'),
                            duration: notify.duration.MEDIUM,
                        });
                    }
                })
                .build()
        ),
        [],
    );

    const leadStates = useMemo(
        () => listToMap(
            leads,
            leadKeySelector,
            (lead, key) => (
                getLeadState(
                    lead,
                    { leadSaveStatus: leadSaveStatuses[key] },
                )
            ),
        ),
        [leads, leadSaveStatuses],
    );

    const handleOrganizationsAdd = useCallback(
        (newOrganizations) => {
            if (newOrganizations.length <= 0) {
                return;
            }
            mergeOrganizations(newOrganizations);
        },
        [mergeOrganizations],
    );

    const handleLeadGroupsAdd = useCallback(
        (newLeadGroups) => {
            if (newLeadGroups.length <= 0) {
                return;
            }
            setLeadGroups(stateLeadGroups => (
                mergeEntities(stateLeadGroups, newLeadGroups)
            ));
        },
        [],
    );

    const handleLeadSavePendingChange = useCallback(
        (leadKey, leadPending) => {
            setLeadSaveStatuses(statuses => ({
                ...statuses,
                [leadKey]: { pending: leadPending },
            }));
        },
        [],
    );

    const handleLeadsAdd = useCallback(
        (leadsInfo) => {
            const confidentiality = leadOptions?.confidentiality ?? [];
            const priority = leadOptions?.priority ?? [];

            const now = new Date();
            const title = `Lead ${now.toLocaleTimeString()}`;
            const publishedDate = formatDateToString(now, 'yyyy-MM-dd');

            const defaultConfidentiality = confidentiality[0]?.key;
            const defaultPriority = [...priority]
                .sort((a, b) => compareNumber(a.key, b.key))[0]?.key;

            const newLeads = leadsInfo.map((leadInfo) => {
                const {
                    faramValues,
                    // FIXME: IMP serverId is no longer the case
                    serverId,
                } = leadInfo;

                const key = getNewLeadKey();

                const newLead = {
                    id: key,
                    serverId,
                    faramValues: {
                        title,
                        project: projectId,
                        assignee: userId,
                        publishedOn: publishedDate,
                        confidentiality: defaultConfidentiality,
                        priority: defaultPriority,

                        ...faramValues,

                        // NOTE: Server expects a value for authors
                        authors: faramValues.authors ?? [],
                    },
                    faramErrors: {},
                    faramInfo: {
                        error: false,
                        pristine: isDefined(serverId),
                    },
                };

                return newLead;
            });

            appendLeads(newLeads);
        },
        [appendLeads, leadOptions?.confidentiality, leadOptions?.priority, projectId, userId],
    );

    const handleLeadsSave = useCallback(
        (leadKeys) => {
            leadKeys.forEach((leadKey) => {
                // FIXME: use leadKeysMapping
                const lead = leads.find(l => leadKeySelector(l) === leadKey);
                if (!lead) {
                    console.error(`Lead with key ${leadKey} not found.`);
                    return;
                }

                const worker = {
                    start: () => {
                        const serverId = leadIdSelector(lead);
                        const value = leadFaramValuesSelector(lead);

                        const onValidationFailure = (faramErrors) => {
                            changeLead({
                                leadKey,
                                faramErrors,
                            });

                            formCoordinator.notifyComplete(leadKey, true);
                        };

                        const onValidationSuccess = (faramValues) => {
                            let url;
                            let params;
                            if (serverId) {
                                url = createUrlForLeadEdit(serverId);
                                params = () => createParamsForLeadEdit(faramValues);
                            } else {
                                url = urlForLead;
                                params = () => createParamsForLeadCreate(faramValues);
                            }

                            const request = new FgRestBuilder()
                                .url(url)
                                .params(params)
                                .delay(0)
                                .preLoad(() => {
                                    handleLeadSavePendingChange(leadKey, true);
                                })
                                .success((response) => {
                                    saveLead({
                                        leadKey,
                                        lead: response,
                                    });
                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey);
                                })
                                .failure((response) => {
                                    const faramErrors = alterResponseErrorToFaramError(
                                        response.errors,
                                    );

                                    changeLead({
                                        leadKey,
                                        faramErrors,
                                    });

                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey, true);
                                })
                                .fatal(() => {
                                    const faramErrors = {
                                        $internal: ['Error while trying to save lead.'],
                                    };

                                    changeLead({
                                        leadKey,
                                        faramErrors,
                                    });

                                    handleLeadSavePendingChange(leadKey, false);
                                    formCoordinator.notifyComplete(leadKey, true);
                                })
                                .build();
                            request.start();
                        };

                        detachedFaram({
                            value,
                            schema,
                            onValidationFailure,
                            onValidationSuccess,
                        });
                    },
                    stop: () => {
                        // No-op
                    },
                };

                formCoordinator.add(
                    leadKey,
                    worker,
                );
            });
            formCoordinator.start();
        },
        [leads, changeLead, saveLead, formCoordinator, handleLeadSavePendingChange],
    );

    const handleLeadsToRemoveSet = useCallback(
        (leadKeys) => {
            setLeadsToRemove(leadKeys);
            setLeadRemoveConfirmShown(true);
        },
        [],
    );

    const handleLeadsExport = useCallback(
        (leadIds) => {
            setLeadsToExport(leadIds);
            setLeadExportModalShown(true);
        },
        [],
    );

    const handleLeadRemoveConfirmClose = useCallback(
        (confirm) => {
            if (confirm) {
                removeLeads(leadsToRemove);
                if (leadsToRemove.length === 1) {
                    notify.send({
                        title: _ts('addLeads.actions', 'leadDiscard'),
                        type: notify.type.SUCCESS,
                        message: _ts('addLeads.actions', 'leadDiscardSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } else if (leadsToRemove.length > 1) {
                    notify.send({
                        title: _ts('addLeads.actions', 'leadsDiscard'),
                        type: notify.type.SUCCESS,
                        message: _ts('addLeads.actions', 'leadsDiscardSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                }
            }

            setLeadsToRemove([]);
            setLeadRemoveConfirmShown(false);
        },
        [leadsToRemove, removeLeads],
    );

    const handleLeadsExportCancel = useCallback(
        () => {
            setLeadExportModalShown(false);
            setLeadsToExport([]);
        },
        [],
    );

    const handleLeadSave = useCallback(
        (key) => {
            handleLeadsSave([key]);
        },
        [handleLeadsSave],
    );

    const handleLeadExport = useCallback(
        (leadId) => {
            handleLeadsExport([leadId]);
        },
        [handleLeadsExport],
    );

    const handleLeadToRemoveSet = useCallback(
        (leadKey) => {
            handleLeadsToRemoveSet([leadKey]);
        },
        [handleLeadsToRemoveSet],
    );


    const [connectorsPending, connectorsResponse] = useRequest({
        url: `server://projects/${projectId}/unified-connectors/`,
        mockResponse: mockConnectors,
        autoTrigger: true,
    });
    const [selectedConnector, setSelectedConnector] = useState(undefined);
    // TODO: validate this selected connector source
    const [selectedConnectorSource, setSelectedConnectorSource] = useState(undefined);
    // TODO: validate this selected connector lead
    const [selectedConnectorLead, setSelectedConnectorLead] = useState(undefined);
    const connectors = connectorsResponse?.results;

    let connectorLeadUrl;
    if (selectedConnectorSource) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connector-sources/${selectedConnectorSource}/leads/`;
    } else if (selectedConnector) {
        connectorLeadUrl = `server://projects/${projectId}/unified-connectors/${selectedConnector}/leads/`;
    }

    const [connectorLeadsPending, connectorLeadsResponse] = useRequest({
        url: connectorLeadUrl,
        query: {
            offset: 1,
            limit: 20,
        },
        mockResponse: mockLeads,
        autoTrigger: true,
    });

    const connectorMode = !!selectedConnector;
    const hasActiveConnectorLead = !!selectedConnectorLead;

    const hasActiveLead = isDefined(activeLead);
    const leadIsTextType = hasActiveLead && (
        leadSourceTypeSelector(activeLead) === LEAD_TYPE.text
    );
    const activeLeadKey = activeLead
        ? leadKeySelector(activeLead)
        : undefined;
    const activeLeadState = activeLeadKey
        ? leadStates[activeLeadKey]
        : undefined;
    const leadPreviewMinimized = leadPreviewHidden || leadIsTextType;

    // TODO: IMP calculate this value
    const saveEnabledForAll = false;

    return (
        <>
            <Prompt
                message={
                    (location) => {
                        if (location.pathname === routeUrl) {
                            return true;
                        } else if (!saveEnabledForAll) {
                            return true;
                        }
                        return _ts('common', 'youHaveUnsavedChanges');
                    }
                }
            />
            <Page
                className={styles.addLead}
                headerClassName={styles.header}
                header={(
                    <>
                        <BackLink
                            defaultLink={reverseRoute(pathNames.leads, { projectId })}
                        />
                        <h4 className={styles.heading}>
                            {/* TODO: translate this */}
                            Add Leads
                        </h4>
                    </>
                )}
                mainContentClassName={styles.mainContent}
                mainContent={(
                    <>
                        <Cloak
                            hide={shouldHideButtons}
                            render={(
                                <div className={styles.leftPane}>
                                    <LeadProcessor>
                                        <LeadSources
                                            className={styles.leadButtons}
                                            onLeadsAdd={handleLeadsAdd}
                                            leadStates={leadStates}
                                            activeSource={activeSource}
                                            onSourceChange={(source) => {
                                                onSourceChange(source);
                                                setSelectedConnector(undefined);
                                                setSelectedConnectorSource(undefined);
                                            }}
                                        />
                                        {connectors && connectors.length > 0 && (
                                            <h4>
                                                {/* FIXME: use strings */}
                                                Connectors
                                            </h4>
                                        )}
                                        {connectors?.map(connector => (
                                            <div
                                                key={connector.id}
                                                className={styles.connectorContainer}
                                            >
                                                <LeadListItem
                                                    key={connector.id}
                                                    className={styles.connector}
                                                    title={connector.title}
                                                    type={LEAD_TYPE.connectors}
                                                    // eslint-disable-next-line max-len
                                                    active={connector.id === selectedConnector && !selectedConnectorSource}
                                                    onItemSelect={() => {
                                                        onSourceChange(undefined);
                                                        setSelectedConnector(connector.id);
                                                        setSelectedConnectorSource(undefined);
                                                    }}
                                                    count={connector.stats?.noOfLeads}
                                                />
                                                {connector.sources.map(source => (
                                                    <LeadListItem
                                                        className={styles.subConnector}
                                                        key={source.id}
                                                        title={source.source}
                                                        // eslint-disable-next-line max-len
                                                        active={connector.id === selectedConnector && source.id === selectedConnectorSource}
                                                        onItemSelect={() => {
                                                            onSourceChange(undefined);
                                                            setSelectedConnector(connector.id);
                                                            setSelectedConnectorSource(source.id);
                                                        }}
                                                        count={source.stats?.noOfLeads}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                        <CandidateLeads
                                            className={styles.candidateLeadsBox}
                                            onLeadsAdd={handleLeadsAdd}
                                            onOrganizationsAdd={mergeOrganizations}
                                        />
                                    </LeadProcessor>
                                </div>
                            )}
                        />
                        <div className={styles.main}>
                            {!connectorMode && (
                                <>
                                    <div className={styles.bar}>
                                        <LeadFilter
                                            className={styles.filter}
                                        />
                                        <LeadActions
                                            className={styles.actions}
                                            disabled={submitAllPending}
                                            leadStates={leadStates}

                                            onLeadsSave={handleLeadsSave}
                                            onLeadsRemove={handleLeadsToRemoveSet}
                                            onLeadsExport={handleLeadsExport}
                                        />
                                    </div>
                                    <div className={styles.content}>
                                        <LeadList
                                            className={styles.list}
                                            leadStates={leadStates}
                                            onLeadRemove={handleLeadToRemoveSet}
                                            onLeadExport={handleLeadExport}
                                            onLeadSave={handleLeadSave}
                                        />
                                        {hasActiveLead ? (
                                            <ResizableV
                                                className={_cs(
                                                    styles.leadDetail,
                                                    leadPreviewMinimized && styles.textLead,
                                                )}
                                                topContainerClassName={styles.top}
                                                bottomContainerClassName={styles.bottom}
                                                disabled={leadPreviewMinimized}
                                                topChild={(
                                                    <LeadDetail
                                                        key={activeLeadKey}
                                                        leadState={activeLeadState}
                                                        bulkActionDisabled={submitAllPending}

                                                        pending={pending}

                                                        priorityOptions={leadOptions?.priority}
                                                        confidentialityOptions={leadOptions?.confidentiality} // eslint-disable-line max-len
                                                        assignees={leadOptions?.members}

                                                        leadGroups={leadGroups}
                                                        onLeadGroupsAdd={handleLeadGroupsAdd}

                                                        organizations={organizations}
                                                        onOrganizationsAdd={handleOrganizationsAdd}
                                                    />
                                                )}
                                                bottomChild={!leadPreviewMinimized && (
                                                    <LeadPreview
                                                        // NOTE: need to dismount
                                                        // LeadPreview because the
                                                        // children cannot handle
                                                        // change gracefully
                                                        key={activeLeadKey}
                                                        className={styles.leadPreview}
                                                    />
                                                )}
                                            />
                                        ) : (
                                            <Message>
                                                { _ts('addLeads', 'noLeadsText') }
                                            </Message>
                                        )}
                                    </div>
                                </>
                            )}
                            {connectorMode && (
                                <div className={styles.content}>
                                    {/* TODO: add actions */}
                                    <div className={styles.list}>
                                        <div> Lead list goes here </div>
                                    </div>
                                    {hasActiveConnectorLead ? (
                                        <div className={styles.leadDetail}>
                                            Lead preview goes here
                                        </div>
                                    ) : (
                                        <Message>
                                            { _ts('addLeads', 'noLeadsText') }
                                        </Message>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            />
            {leadExportModalShown && (
                <LeadCopyModal
                    leads={leadsToExport}
                    closeModal={handleLeadsExportCancel}
                />
            )}
            {leadRemoveConfirmShown && (
                <Confirm
                    onClose={handleLeadRemoveConfirmClose}
                    show
                >
                    <p>
                        {/* TODO: different message for delete modes */}
                        {_ts('addLeads.actions', 'deleteLeadConfirmText')}
                    </p>
                </Confirm>
            )}
        </>
    );
}
LeadAdd.propTypes = propTypes;
LeadAdd.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestCoordinator(LeadAdd),
);
