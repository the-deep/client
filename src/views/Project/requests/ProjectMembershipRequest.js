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
    }

    init = (memberList) => {
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
        this.parent.setMemberships(response.results);
    }

    init = (projectId) => {
        this.createDefault({
            url: createUrlForProjectMembership(projectId),
            params: createParamsForGet(),
        });
        return this;
    }
}
