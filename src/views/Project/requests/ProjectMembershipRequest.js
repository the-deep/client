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
        // TODO: CHECK VALIDATION
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
        const pending = true;
        this.parent.setState({ pending });
    }

    handleAfterLoad = () => {
        const pending = false;
        this.parent.setState({ pending });
    }

    init = (memberShipId) => {
        this.createDefault({
            url: createUrlForUserProjectMembership(memberShipId),
            params: createParamsForUserProjectMembershipDelete(),
        });
        return this;
    }
}


export class ProjectMembershipsGetRequest extends Request {
    // TODO: schemaName

    handlePreLoad = () => {
    }

    handleAfterLoad = () => {
    }

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
