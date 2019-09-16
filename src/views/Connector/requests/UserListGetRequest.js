import { FgRestBuilder } from '#rsu/rest';
import {
    createParamsForGet,
    createUrlForUsers,
} from '#rest';

import schema from '#schema';
import notify from '#notify';
import _ts from '#ts';

export default class UserListGetRequest {
    constructor(props) {
        this.props = props;
    }

    success = (response) => {
        const { setUsers } = this.props;
        try {
            schema.validate(response, 'usersGetResponse');
            setUsers({ users: response.results });
        } catch (er) {
            console.error(er);
        }
    }

    failure = (response) => {
        notify.send({
            title: _ts('connector', 'usersTitle'),
            type: notify.type.ERROR,
            message: response.error,
            duration: notify.duration.MEDIUM,
        });
    }

    fatal = () => {
        notify.send({
            title: _ts('connector', 'usersTitle'),
            type: notify.type.ERROR,
            message: _ts('connector', 'usersListGetFailure'),
            duration: notify.duration.MEDIUM,
        });
    }

    create = () => {
        const usersFields = ['display_name', 'email', 'id'];
        const userListGetRequest = new FgRestBuilder()
            .url(createUrlForUsers(usersFields))
            .params(createParamsForGet)
            .preLoad(() => { this.props.setState({ userDataLoading: true }); })
            .postLoad(() => { this.props.setState({ userDataLoading: false }); })
            .success(this.success)
            .failure(this.failure)
            .fatal(this.fatal)
            .build();
        return userListGetRequest;
    }
}
