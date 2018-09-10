import Request from '#utils/Request';

import {
    createParamsForProjectUserGroupCreate,
    urlForProjectUserGroup,
} from '#rest';


export default class ProjectUserGroupRequest extends Request {
    // TODO: schemaName =

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
