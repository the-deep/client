import {
    createUrlForUsers,
    createParamsForGet,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * parent: setState, setUsers
*/
export default class UsersGetRequest extends Request {
    schemaName = 'usersGetResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUsers({
            users: response.results,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipCreate'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'usersPullFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userGroup', 'userMembershipCreate'),
            type: notify.type.ERROR,
            message: _ts('userGroup', 'usersPullFailure'),
            duration: notify.duration.SLOW,
        });
    }

    init = () => {
        const fields = ['display_name', 'email', 'id'];
        this.createDefault({
            url: createUrlForUsers([fields]),
            params: createParamsForGet,
        });
        return this;
    }
}
