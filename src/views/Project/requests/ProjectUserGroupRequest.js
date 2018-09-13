import Request from '#utils/Request';

import {
    createParamsForProjectUserGroupCreate,
    urlForProjectUserGroup,

    createParamsForGet,
    createParamsForDelete,
    createUrlForProjectUserGroupGet,
    createUrlForProjectUserGroupDelete,
} from '#rest';


export default class ProjectUserGroupPostRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
        this.parent.setParentPending(true);
    }

    handlePostLoad = () => {
        this.parent.setParentPending(false);
    }

    handleSuccess = (response) => {
        // TODO: CHECK VALIDATION
        this.parent.addProjectUserGroup(this.projectId, response);
        this.parent.getMemberships();
        this.parent.setParentPending(false);
        this.parent.clearSearchInput();
    }

    init = (projectId, projectUserGroup) => {
        this.projectId = projectId;
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
        this.parent.setUserGroups(results, this.projectId);
    }

    init = (projectId) => {
        this.projectId = projectId;
        this.createDefault({
            url: createUrlForProjectUserGroupGet(projectId),
            params: createParamsForGet,
        });
        return this;
    }
}


export class ProjectUserGroupDeleteRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
        this.parent.setParentPending(true);
    }

    handlePostLoad = () => {
        this.parent.setParentPending(false);
    }

    handleSuccess = () => {
        this.parent.removeUserGroup(this.projectId, this.userGroup);
        this.parent.getMemberships();
    }

    init = (projectId, userGroup) => {
        this.projectId = projectId;
        this.userGroup = userGroup;

        this.createDefault({
            url: createUrlForProjectUserGroupDelete(userGroup.id),
            params: createParamsForDelete,
        });
        return this;
    }
}
