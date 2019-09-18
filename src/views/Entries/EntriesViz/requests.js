import notify from '#notify';
import _ts from '#ts';


const requests = {
    entriesVizGetRequest: {
        onMount: true,
        // TODO: Don't send request if EntriesViz is hidden (Depends on framework)
        onPropsChanged: ['projectId'],
        schemaName: 'entriesVizGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/entries-viz/`,
        options: ({ params: { setState } }) => ({
            pollTime: 20000,
            maxPollAttempts: 10,
            shouldPoll: (r) => {
                if (r.data) {
                    setState({ dataUrl: r.data });
                }
                return r.status === 'pending' || r.status === 'started';
            },
        }),
        onSuccess: ({ response }) => {
            if (response.status === 'failure') {
                notify.send({
                    title: _ts('project', 'entriesViz'),
                    type: notify.type.WARNING,
                    message: _ts('project', 'entriesVizFailure'),
                    duration: notify.duration.MEDIUM,
                });
            }
        },
        onFailure: () => {
            notify.send({
                title: _ts('project', 'entriesViz'),
                type: notify.type.WARNING,
                message: _ts('project', 'entriesVizFailure'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project', 'entriesViz'),
                type: notify.type.ERROR,
                message: _ts('project', 'entriesVizFatal'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

export default requests;
