import Request from '#utils/Request';

import {
    createParamsForProjectMembershipCreate,
    urlForProjectMembership,
} from '#rest';


export default class ProjectMembershipPostRequest extends Request {
    // schemaName =

    init = (memberList) => {
        this.createDefault({
            url: urlForProjectMembership,
            params: createParamsForProjectMembershipCreate({
                memberList,
            }),
        });
        return this;
    }
}
