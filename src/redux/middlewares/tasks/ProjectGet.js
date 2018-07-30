import { BgRestBuilder } from '#rsu/rest';

import {
    createParamsForGet,
    urlForProjects,
} from '#rest';
import schema from '#schema';
import AbstractTask from '#utils/AbstractTask';

import { activeUserSelector } from '../../selectors/auth';
import { setUserProjectsAction } from '../../reducers/domainData/projects';
import { setWaitingForProjectAction } from '../../reducers/app';

export default class ProjectGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createProjectsRequest = (store) => {
        const projectsRequest = new BgRestBuilder()
            .url(urlForProjects)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsMiniGetResponse');
                    const { userId } = activeUserSelector(store.getState());

                    store.dispatch(setUserProjectsAction({
                        userId,
                        projects: response.results,
                        extra: response.extra,
                    }));
                    store.dispatch(setWaitingForProjectAction(false));
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectsRequest;
    }

    start = () => {
        this.stop();

        this.projectsRequest = this.createProjectsRequest(this.store);
        this.projectsRequest.start();
    }

    stop = () => {
        if (this.projectsRequest) {
            this.projectsRequest.stop();
        }
    }
}
