import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    urlForUserGroups,
    createParamsForUserGroupsCreate,
} from '#rest';

export default class UserGroupPostRequest extends Request {
    schemaName = 'userGroupCreateResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserGroup({
            userId: this.userId,
            usergroup: response,
        });
        notify.send({
            title: _ts('userProfile', 'userGroupCreate'),
            type: notify.type.SUCCESS,
            message: _ts('userProfile', 'userGroupCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.handleModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        this.parent.setState({
            // FIXME: use strings
            faramErrors: { $internal: ['Error while trying to save user group.'] },
        });
    }

    init = (params, userId) => {
        this.userId = userId;
        this.createDefault({
            url: urlForUserGroups,
            params: createParamsForUserGroupsCreate(params),
        });
        return this;
    }
}
