import { FgRestBuilder } from '#rs/utils/rest';
import {
    createUrlForUserMembership,
    createParamsForUserMembershipRoleChange,
} from '#rest';
import schema from '#schema';
import notify from '#notify';
import _ts from '#ts';

/*
 * props: setState, setUserMembership
*/

export default class MembershipRoleChangeRequest {
    constructor(props) {
        this.props = props;
    }

    success = userGroupId => (response) => {
        try {
            schema.validate({ results: [response] }, 'userMembershipCreateResponse');
            this.props.setUserMembership({
                userMembership: response,
                userGroupId,
            });
            notify.send({
                title: _ts('userGroup', 'userMembershipRole'),
                type: notify.type.SUCCESS,
                message: _ts('userGroup', 'userMembershipRoleSuccess'),
                duration: notify.duration.MEDIUM,
            });
        } catch (er) {
            console.error(er);
        }
    }

    failure = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipRoleFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipRole'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'userMembershipRoleFatal'),
            duration: notify.duration.SLOW,
        });
    }

    create = ({ membershipId, newRole }, userGroupId) => {
        const membershipRoleChangeRequest = new FgRestBuilder()
            .url(createUrlForUserMembership(membershipId))
            .params(() => createParamsForUserMembershipRoleChange({ newRole }))
            .preLoad(() => { this.props.setState({ actionPending: true }); })
            .postLoad(() => { this.props.setState({ actionPending: false }); })
            .success(this.success(userGroupId))
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return membershipRoleChangeRequest;
    }
}
