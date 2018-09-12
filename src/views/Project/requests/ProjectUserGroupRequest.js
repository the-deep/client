import Request from '#utils/Request';

import {
    createParamsForProjectUserGroupCreate,
    urlForProjectUserGroup,

    createParamsForGet,
    createUrlForProjectUserGroupGet,
} from '#rest';


export default class ProjectUserGroupRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
        const pending = true;
        this.parent.setParentState({ pending });
    }

    handleAfterLoad = () => {
        const pending = false;
        this.parent.setParentState({ pending });
    }

    handleSuccess = () => {
    }

    init = (projectUserGroup) => {
        this.createDefault({
            url: urlForProjectUserGroup,
            params: createParamsForProjectUserGroupCreate({
                ...projectUserGroup,
            }),
        });
        return this;
    }
}


export class ProjectUserGroupsGetRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
    }

    handleAfterLoad = () => {
    }

    handleSuccess = (response) => {
        const results = response.results || [];
        const usergroups = results.length > 0 ? results[0].userGroups : [];
        console.warn('SUCCESS USERGROUPS');

        this.parent.setUsergroups(usergroups, this.projectId);
    }

    init = (projectId) => {
        this.projectId = projectId;
        this.createDefault({
            url: createUrlForProjectUserGroupGet(projectId),
            params: createParamsForGet(),
        });
        return this;
    }
}
