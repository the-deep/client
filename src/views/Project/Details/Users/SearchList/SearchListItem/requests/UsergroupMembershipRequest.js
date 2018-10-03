import Request from '#utils/Request';

import {
    createParamsForProjectUserGroupCreate,
    urlForProjectUserGroup,
} from '#rest';


// TODO: handle errors, schemaName
export default class UsergroupMembershipRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingMembershipRequest: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingMembershipRequest: false });
    }

    handleSuccess = (response) => {
        console.warn(response);

        /*
        this.parent.addProjectUserGroup(this.projectId, response);
        this.parent.getMemberships();
        this.parent.setParentPending(false);
        this.parent.clearSearchInput();
        */
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
