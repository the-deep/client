import notify from '#notify';
import _ts from '#ts';

const PROJECT_VIZ_POLL_TIME = 3000;

const requestOptions = {
    // NOTE: This is also used by ArysViz component. (Look for projectVizDataUrl)
    projectVizGetRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        schemaName: 'projectVizGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/project-viz/`,
        options: ({ params: { setState } }) => ({
            pollTime: PROJECT_VIZ_POLL_TIME,
            maxPollAttempts: 20,
            shouldPoll: (r) => {
                if (r.data) {
                    setState({ projectVizDataUrl: r.data });
                }
                return r.status === 'pending' || r.status === 'started';
            },
        }),
        onSuccess: ({ response, props }) => {
            if (props.onShareLinkChange) {
                props.onShareLinkChange(response.publicUrl);
            }
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
