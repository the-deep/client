import {
    createUrlForUserGroup,
    createParamsForUserGroupsPatch,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';


/*
 * props: setState, setUsergroupView, handleModalClose
*/
export default class UserGroupPatchRequest extends Request {
    schemaName = 'userGroupCreateResponse'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUsergroupView({
            usergroupId: this.extraParent.userGroupId,
            information: response,
        });
        notify.send({
            title: _ts('userGroup', 'userGroupEdit'),
            type: notify.type.SUCCESS,
            message: _ts('userGroup', 'userGroupEditSuccess'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.handleModalClose();
    }

    handleFailure = (faramErrors) => {
        this.parent.setState({ faramErrors });
    }

    handleFatal = () => {
        this.parent.setState({
            faramErrors: { $internal: [_ts('userGroup', 'userGroupPatchFatal')] },
        });
    }

    init = (userGroupId, { title, description }) => {
        this.extraParent = { userGroupId };
        this.createDefault({
            url: createUrlForUserGroup(userGroupId),
            params: createParamsForUserGroupsPatch({ title, description }),
        });
        return this;
    }
}
