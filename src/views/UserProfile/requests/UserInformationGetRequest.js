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
            userId: this.extraParent.userId,
            information: response,
        });
    }

    handleFailure = (_, response) => {
        if (response.errorCode === 404) {
            this.parent.unsetUserProfile({ userId: this.extraParent.userId });
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

    init = (userId) => {
        this.extraParent = { userId };
        this.createDefault({
            url: createUrlForUser(userId),
            params: createParamsForGet(),
        });
        return this;
    }
}
