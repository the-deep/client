import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForProjectsOfUser,
    createParamsForGet,
} from '#rest';

export default class UserProjectsGetRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ userProjectsPending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ userProjectsPending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserProfile({
            userId: this.extraParent.userId,
            projects: response.results,
            // extra: response.extra,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('userProfile', 'userProfileLabel'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userProjectsGetFailure'),
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('userProfile', 'userProfileLabel'),
            type: notify.type.ERROR,
            message: _ts('userProfile', 'userProjectsGetFatal'),
            duration: notify.duration.MEDIUM,
        });
    }

    init = (userId) => {
        this.extraParent = { userId };
        this.createDefault({
            url: createUrlForProjectsOfUser(this.extraParent.userId),
            params: createParamsForGet(),
        });
        return this;
    }
}
