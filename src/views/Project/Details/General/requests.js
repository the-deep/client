import { requestMethods } from '#request';
import notify from '#notify';
import { checkVersion } from '#rsu/common';
import _ts from '#ts';


const requests = {
    projectGetRequest: {
        onMount: true,
        onPropsChanged: ['projectId'],
        schema: 'projectGetResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        onSuccess: ({ props, response, params = {} }) => {
            const {
                setProjectDetails,
                projectServerData,
                projectId,
            } = props;
            const { isBeingCancelled = false } = params;
            const {
                shouldSetValue,
                isValueOverriden,
            } = checkVersion(projectServerData.versionId, response.versionId);

            if (shouldSetValue || isBeingCancelled) {
                const project = {
                    faramValues: response,
                };
                setProjectDetails({ project, projectId });
            }
            if (isValueOverriden && !isBeingCancelled) {
                notify.send({
                    type: notify.type.WARNING,
                    title: _ts('project', 'project'),
                    message: _ts('project', 'projectUpdateOverriden'),
                    duration: notify.duration.SLOW,
                });
            }
        },
        onFailure: ({ props, faramErrors }) => {
            props.setErrorProjectDetails({
                faramErrors,
                projectId: props.projectId,
            });
        },
        onFatal: ({ props }) => {
            props.setErrorProjectDetails({
                faramErrors: { $internal: [_ts('project', 'projectGetFailure')] },
                projectId: props.projectId,
            });
        },
    },

    projectPutRequest: {
        schema: 'projectPutResponse',
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        method: requestMethods.PUT,
        body: ({ params }) => params.projectDetails,
        onSuccess: ({ props, response }) => {
            const { setProjectDetails, projectId } = props;
            const project = { faramValues: response };
            setProjectDetails({
                project, projectId,
            });
        },
        onFailure: ({ props, faramErrors }) => {
            props.setErrorProjectDetails({
                faramErrors,
                projectId: props.projectId,
            });
        },
        onFatal: ({ props }) => {
            props.setErrorProjectDetails({
                faramErrors: { $internal: [_ts('project', 'projectPutFailure')] },
                projectId: props.projectId,
            });
        },
    },

    projectDeleteRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/`,
        method: requestMethods.DELETE,
        onSuccess: ({ props }) => {
            const {
                projectId,
                unsetProject,
            } = props;
            unsetProject({ projectId });
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.SUCCESS,
                message: _ts('project', 'projectDeleteSuccess'),
                duration: notify.duration.MEDIUM,
            });
        },
        onFailure: () => {
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.ERROR,
                message: _ts('project', 'projectDeleteFailure'),
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('project', 'projectDelete'),
                type: notify.type.ERROR,
                message: _ts('project', 'projectDeleteFailure'),
                duration: notify.duration.SLOW,
            });
        },
    },
};

export default requests;
