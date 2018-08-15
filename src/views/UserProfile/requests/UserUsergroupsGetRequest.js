import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForUserGroupsOfUser,
    createParamsForGet,
} from '#rest';

export default class UserUsergroupsPending extends Request {
    schemaName = 'userGroupsGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ userUsergroupsPending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ userUsergroupsPending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserProfile({
            userId: this.parent.userId,
            usergroups: response.results,
        });
    }

    handleFailure = (response) => {
        if (response.errorCode === 404) {
            this.parent.unsetUser({ userId: this.parent.userId });
        } else {
            console.info('FAILURE:', response);
        }
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userProfile', 'userProfileLabel'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userUsergroupPending'),
            duration: notify.duration.SLOW,
        });
    }

    init = () => {
        this.createDefault({
            url: createUrlForUserGroupsOfUser(this.parent.userId),
            params: createParamsForGet(),
        });
    }
}
