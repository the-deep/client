import { FgRestBuilder } from '#rs/utils/rest';
import {
    createUrlForUserPatch,
    createParamsForUserPatch,
    alterResponseErrorToFaramError,
} from '#rest';
import notify from '#notify';
import schema from '#schema';
import _ts from '#ts';

export default class UserPatchRequest {
    constructor(props) {
        this.props = props;
    }

    create = (userId, data) => {
        const urlForUser = createUrlForUserPatch(userId);
        const userPatchRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(() => createParamsForUserPatch(data))
            .preLoad(() => {
                this.props.setState({ pending: true });
            })
            .postLoad(() => {
                this.props.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPatchResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                    notify.send({
                        title: _ts('userProfile', 'userProfileEdit'),
                        type: notify.type.SUCCESS,
                        message: _ts('userProfile', 'userEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: _ts('userProfile', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'userEditFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.props.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('userProfile', 'userProfileEdit'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'userEditFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.props.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to save user.'] },
                });
            })
            .build();
        return userPatchRequest;
    }
}
