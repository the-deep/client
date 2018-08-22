import {
    urlForUserMembership,
    createParamsForUserMembershipCreate,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * parent: setState, addMemberships, onModalClose
*/

export default class MembershipPostRequest extends Request {
    schemaName = 'userMembershipCreateResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        const { usergroupId } = this.extraParent;
        this.parent.addMemberships({
            memberships: response.results,
            usergroupId,
        });
        notify.send({
            title: _ts('userGroup', 'userMembershipCreate'),
            type: notify.type.SUCCESS,
            message: _ts('userGroup', 'userMembershipCreateSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.onModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        this.parent.setState({
            faramErrors: { $internal: [_ts('userGroup', 'addMemberErrorText')] },
        });
    }

    init = (memberList, usergroupId) => {
        this.extraParent = { usergroupId };
        this.createDefault({
            url: urlForUserMembership,
            params: createParamsForUserMembershipCreate({ memberList }),
        });
        return this;
    }
}
