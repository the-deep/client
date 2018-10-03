import Request from '#utils/Request';

import {
    urlForProjectMembership,
    createParamsForProjectMembershipCreate,
} from '#rest';

// TODO: handle errors, schemaName
export default class UserMembershipRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingMembershipRequest: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pendingMembershipRequest: false });
    }

    handleSuccess = (response) => {
        const {
            results = [],
        } = response;

        console.warn(results);

        /*
        if (results.length > 0) {
            this.parent.addProjectMember({
                projectId: this.projectId,
                membership: results[0],
            });
        }
        */
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
