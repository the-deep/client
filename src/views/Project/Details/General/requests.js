import { requestMethods } from '#request';
import notify from '#notify';
import { getNewActiveProjectId } from '#entities/project';
import { checkVersion } from '@togglecorp/fujs';
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
};

export default requests;
