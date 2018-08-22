import {
    createUrlForUserMembership,
    createParamsForUserMembershipRoleChange,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * parent: setState, setMembership
*/

export default class MembershipRoleChangeRequest extends Request {
    schemaName = 'userGroupMembership'

    handlePreLoad = () => {
        this.parent.setState({ actionPending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ actionPending: false });
    }

    handleSuccess = (response) => {
        const { usergroupId } = this.extraParent;
        this.parent.setMembership({
            usergroupId,
            membership: response,
        });
        notify.send({
            title: _ts('userGroup', 'userMembershipRole'),
            type: notify.type.SUCCESS,
            message: _ts('userGroup', 'userMembershipRoleSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipRoleFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipRoleFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = (usergroupId, membershipId, values) => {
        this.extraParent = { usergroupId };
        this.createDefault({
            url: createUrlForUserMembership(membershipId),
            params: createParamsForUserMembershipRoleChange(values),
        });
        return this;
    }
}
