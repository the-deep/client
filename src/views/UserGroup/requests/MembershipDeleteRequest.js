import {
    createUrlForUserMembership,
    createParamsForUserMembershipDelete,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * parent: setState, unSetMembership
*/

export default class MembershipDeleteRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ actionPending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ actionPending: false });
    }

    handleSuccess = () => {
        const { membershipId, usergroupId } = this.extraParent;
        this.parent.unSetMembership({
            membershipId,
            usergroupId,
        });
        notify.send({
            title: _ts('userGroup', 'userMembershipDelete'),
            type: notify.type.SUCCESS,
            message: _ts('userGroup', 'userMembershipDeleteSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipDelete'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipDeleteFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipDelete'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipDeleteFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = (membershipId, usergroupId) => {
        this.extraParent = { membershipId, usergroupId };
        this.createDefault({
            url: createUrlForUserMembership(membershipId),
            params: createParamsForUserMembershipDelete,
        });
        return this;
    }
}
