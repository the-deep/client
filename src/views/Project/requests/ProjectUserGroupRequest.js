import Request from '#utils/Request';

import {
    createParamsForProjectUserGroupCreate,
    urlForProjectUserGroup,
} from '#rest';


export default class ProjectUserGroupRequest extends Request {
    // TODO: schemaName =

    handlePreLoad = () => {
        const pending = true;
        this.parent.setParentState({ pending });
    }

    handleAfterLoad = () => {
        const pending = false;
        this.parent.setParentState({ pending });
    }

    handleSuccess = () => {
    }

    init = (projectUserGroup) => {
        this.createDefault({
            url: urlForProjectUserGroup,
            params: createParamsForProjectUserGroupCreate({
                ...projectUserGroup,
            }),
        });
        return this;
    }
}
