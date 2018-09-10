import Request from '#utils/Request';

import {
    createParamsForProjectMembershipCreate,
    urlForProjectMembership,
} from '#rest';


export default class ProjectMembershipPostRequest extends Request {
    // TODO: schemaName =

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
