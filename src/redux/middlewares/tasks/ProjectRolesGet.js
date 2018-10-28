import { BgRestBuilder } from '#rsu/rest';

import {
    createParamsForGet,
    urlForProjectRoles,
} from '#rest';
import schema from '#schema';
import AbstractTask from '#utils/AbstractTask';

import { setProjectRolesAction } from '../../reducers/domainData/projects';
import { setWaitingForProjectRolesAction } from '../../reducers/app';

export default class ProjectRolesGet extends AbstractTask {
    constructor(store) {
        super();
        this.store = store;
    }

    createProjectRolesRequest = (store) => {
        const projectRolesRequest = new BgRestBuilder()
            .url(urlForProjectRoles)
            .params(createParamsForGet)
            .success((response) => {
                try {
                    schema.validate(response, 'projectRolesGetResponse');
                    store.dispatch(setProjectRolesAction({
                        projectRoles: response.results,
                    }));
                    store.dispatch(setWaitingForProjectRolesAction(false));
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectRolesRequest;
    }

    start = () => {
        this.stop();

        this.projectRolesRequest = this.createProjectRolesRequest(this.store);
        this.projectRolesRequest.start();
    }

    stop = () => {
        if (this.projectRolesRequest) {
            this.projectRolesRequest.stop();
        }
    }
}
