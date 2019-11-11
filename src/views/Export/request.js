import { methods } from '#request';
import { getFiltersForRequest } from '#entities/lead';

import notify from '#notify';
import _ts from '#ts';

const requestOptions = {
    leadsGetRequest: {
        url: '/v2/leads/filter/',
        method: methods.POST,
        onMount: true,
        query: ({
            fields: ['id', 'title', 'created_at'],
        }),
        body: ({
            props: {
                projectId,
                filters,
                projectRole: {
                    exportPermissions = {},
                },
            },
        }) => {
            const filterOnlyUnprotected = exportPermissions.create_only_unprotected;
            const sanitizedFilters = getFiltersForRequest(filters);

            // Unprotected filter is sent to request to fetch leads
            // if user cannot create export for confidential documents
            if (filterOnlyUnprotected) {
                sanitizedFilters.confidentiality = ['unprotected'];
            }

            return ({
                project: [projectId],
                ...sanitizedFilters,
            });
        },
        onPropsChanged: [
            'projectId',
            'filters',
        ],
        onSuccess: ({
            response,
            params: { setLeads: setLeadsFromParams },
        }) => {
            setLeadsFromParams(response);
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('export', 'leadsLabel'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
    },
    analysisFrameworkRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/analysis-framework/`,
        method: methods.GET,
        onPropsChanged: ['projectId'],
        onMount: true,
        onSuccess: ({
            props: { setAnalysisFramework },
            response,
        }) => {
            setAnalysisFramework({ analysisFramework: response });
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('export', 'afLabel'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('export', 'afLabel'),
                type: notify.type.ERROR,
                message: _ts('export', 'cantLoadAf'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'analysisFramework',
        },
    },
    geoOptionsRequest: {
        url: '/geo-options',
        query: ({ props: { projectId } }) => ({
            project: projectId,
        }),
        method: methods.GET,
        onPropsChanged: ['projectId'],
        onMount: true,
        onSuccess: ({
            props: {
                projectId,
                setGeoOptions,
            },
            response,
        }) => {
            setGeoOptions({
                projectId,
                locations: response,
            });
        },
        onFailure: ({ error: { messageForNotification } }) => {
            notify.send({
                title: _ts('export', 'geoLabel'),
                type: notify.type.ERROR,
                message: messageForNotification,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('export', 'geoLabel'),
                type: notify.type.ERROR,
                message: _ts('export', 'cantLoadGeo'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'geoOptions',
        },
    },
};

export default requestOptions;
