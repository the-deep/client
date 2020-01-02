import notify from '#notify';
import _ts from '#ts';

const ENTRIES_VIZ_POLL_TIME = 3000;

const requestOptions = {
    // NOTE: This is also used by ArysViz component. (Look for entriesDataUrl)
    entriesVizGetRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        schemaName: 'entriesVizGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/entries-viz/`,
        options: ({ params: { setState } }) => ({
            pollTime: ENTRIES_VIZ_POLL_TIME,
            maxPollAttempts: 20,
            shouldPoll: (r) => {
                if (r.data) {
                    setState({ entriesDataUrl: r.data });
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
};

export default requestOptions;
