import notify from '#notify';
import _ts from '#ts';

const ENTRIES_VIZ_POLL_TIME = 3000;

const requestOptions = {
    // NOTE: There is a similar request in entries viz, so any changes here may need
    // to be reflected on the other one as well
    entriesVizGetRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        schemaName: 'entriesVizGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/entries-viz/`,
        options: ({ params: { setEntriesDataUrl } }) => ({
            pollTime: ENTRIES_VIZ_POLL_TIME,
            maxPollAttempts: 20,
            shouldPoll: (r) => {
                if (r.data) {
                    setEntriesDataUrl(r.data);
                }
                return r.status === 'pending' || r.status === 'started';
            },
        }),
        onSuccess: ({ response }) => {
            if (response.status === 'failure') {
                notify.send({
                    title: _ts('entries.visualization', 'entriesViz'),
                    type: notify.type.WARNING,
                    message: _ts('entries.visualization', 'entriesVizFailure'),
                    duration: notify.duration.MEDIUM,
                });
            }
        },
        onFailure: () => {
            notify.send({
                title: _ts('entries.visualization', 'entriesViz'),
                type: notify.type.WARNING,
                message: _ts('entries.visualization', 'entriesVizFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('entries.visualization', 'entriesViz'),
                type: notify.type.ERROR,
                message: _ts('entries.visualization', 'entriesVizFatal'),
                duration: notify.duration.SLOW,
            });
        },
    },
    arysVizGetRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        schemaName: 'arysVizGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/ary-viz/`,
        options: ({ params: { setAryDataUrl } }) => ({
            pollTime: ENTRIES_VIZ_POLL_TIME,
            maxPollAttempts: 20,
            shouldPoll: (r) => {
                if (r.data) {
                    setAryDataUrl(r.data);
                }
                return r.status === 'pending' || r.status === 'started';
            },
        }),
        onSuccess: ({ response }) => {
            if (response.status === 'failure') {
                notify.send({
                    title: _ts('assessments.visualization', 'assessmentsViz'),
                    type: notify.type.WARNING,
                    message: _ts('assessments.visualization', 'assessmentsVizFailure'),
                    duration: notify.duration.MEDIUM,
                });
            }
        },
        onFailure: () => {
            notify.send({
                title: _ts('assessments.visualization', 'assessmentsViz'),
                type: notify.type.WARNING,
                message: _ts('assessments.visualization', 'assessmentsVizFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('assessments.visualization', 'assessmentsViz'),
                type: notify.type.ERROR,
                message: _ts('assessments.visualization', 'assessmentsVizFatal'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

export default requestOptions;
