import Request from '#utils/Request';

import {
    createUrlForProjectMembership,
    urlForProjectMembership,
    createUrlForUserProjectMembership,

    createParamsForGet,
    createParamsForProjectMembershipCreate,
    createParamsForUserProjectMembershipDelete,
} from '#rest';

export class ProjectMembershipPostRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
        const pending = true;
        this.parent.setParentPending(pending);
    }

    handleAfterLoad = () => {
        const pending = false;
        this.parent.setParentPending(pending);
    }

    handleSuccess = (response) => {
        const results = response.results || [];
        if (results.length > 0) {
            this.parent.addProjectMember(this.projectId, results[0]);
        }
        this.parent.setParentPending(false);
        this.parent.clearSearchInput();
    }

    handleFailure = (response) => {
        console.warn(response);
    }

    init = (projectId, memberList) => {
        this.projectId = projectId;
        this.createDefault({
            url: urlForProjectMembership,
            params: createParamsForProjectMembershipCreate({
                memberList,
            }),
        });
        return this;
    }
}

export class ProjectMembershipDeleteRequest extends Request {
    // TODO: schemaName

    handlePreLoad = () => {
        this.parent.setParentPending(true);
    }

    handlePostLoad = () => {
        this.parent.setParentPending(false);
    }

    handleSuccess = () => {
        this.parent.removeMembership(this.projectId, this.membership);
    }

    init = (projectId, membership) => {
        this.projectId = projectId;
        this.membership = membership;
        this.createDefault({
            url: createUrlForUserProjectMembership(membership.id),
            params: createParamsForUserProjectMembershipDelete(),
        });
        return this;
    }
}


export class ProjectMembershipsGetRequest extends Request {
    // TODO: schemaName

    handleSuccess = (response) => {
        this.parent.setMemberships(response.results, this.projectId);
    }

    init = (projectId) => {
        this.projectId = projectId;
        this.createDefault({
            url: createUrlForProjectMembership(projectId),
            params: createParamsForGet(),
        });
        return this;
    }
}
