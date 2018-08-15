import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForUser,
    createParamsForGet,
} from '#rest';

export default class UserGetResponse extends Request {
    schemaName = 'userGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ userInformationPending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ userInformationPending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserProfile({
            userId: this.parent.userId,
            information: response,
        });
    }

    handleFailure = (_, response) => {
        if (response.errorCode === 404) {
            this.parent.unsetUserProfile({ userId: this.parent.userId });
        } else {
            console.info('FAILURE:', response);
        }
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userProfile', 'userProfileLabel'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userInformationGetFailure'),
            duration: notify.duration.SLOW,
        });
    }

    init = () => {
        this.createDefault({
            url: createUrlForUser(this.parent.userId),
            params: createParamsForGet(),
        });
    }
}
