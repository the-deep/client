import Request from '#utils/Request';
import notify from '#notify';

import {
    createUrlForUsersAndUserGroups,
    createParamsForGet,
} from '#rest';

export default class UsersAndUserGroupsGet extends Request {
    handlePreLoad = () => {
    }

    handleAfterLoad = () => {
    }

    handleSuccess = (response) => {
        const searchResults = response.results;
        this.parent.setState({ searchResults });
    }

    init = (query) => {
        this.createDefault({
            url: createUrlForUsersAndUserGroups(query),
            params: createParamsForGet(),
        });
    }
}
