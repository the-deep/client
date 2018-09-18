import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForUserGroup,
    createParamsForUserGroupsDelete,
} from '#rest';

export default class UserGroupDeleteRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ deletePending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ deletePending: false });
    }

    handleSuccess = () => {
        const { usergroupId, userId } = this.extraParent;
        this.parent.unsetUserGroup({
            usergroupId,
            userId,
        });
        notify.send({
            title: _ts('userProfile', 'userGroupDelete'),
            type: notify.type.SUCCESS,
            message: _ts('userProfile', 'userGroupDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userProfile', 'userGroupDelete'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userGroupDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userProfile', 'userGroupDelete'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userGroupDeleteFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = (usergroupId, userId) => {
        this.extraParent = { usergroupId, userId };
        this.createDefault({
            url: createUrlForUserGroup(usergroupId),
            params: createParamsForUserGroupsDelete(),
        });
        return this;
    }
}
