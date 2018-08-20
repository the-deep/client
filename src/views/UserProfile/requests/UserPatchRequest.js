import {
    createUrlForUserPatch,
    createParamsForUserPatch,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

export default class UserPatchRequest extends Request {
    schemaName = 'userPatchResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFailure = () => {
        this.parent.setState({
            // FIXME: use strings
            faramErrors: { $internal: ['Error while trying to save user.'] },
        });
    }

    handleSuccess = (response) => {
        const { userId } = this.extraParent;
        const { previousUserData = {} } = this.parent;
        this.parent.setUserInformation({
            userId,
            information: response,
        });
        notify.send({
            title: _ts('userProfile', 'userProfileEdit'),
            type: notify.type.SUCCESS,
            message: _ts('userProfile', 'userEditSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.handleModalClose();
        if (response.language !== previousUserData.language) {
            window.location.reload();
        }
    }

    init = (userId, data) => {
        this.extraParent = { userId };

        this.createDefault({
            url: createUrlForUserPatch(userId),
            params: createParamsForUserPatch(data),
        });
        return this;
    }
}
