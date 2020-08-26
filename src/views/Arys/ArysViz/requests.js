import notify from '#notify';
import _ts from '#ts';

const PROJECT_VIZ_POLL_TIME = 3000;

const requestOptions = {
    // NOTE: There is a similar request in entries viz, so any changes here may need
    // to be reflected on the other one as well
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
