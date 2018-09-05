import Request from '#utils/Request';

import {
    createUrlForUsersAndUserGroups,
    createParamsForGet,
} from '#rest';

export default class UsersAndUserGroupsGet extends Request {
    schemaName = 'usersAndUserGroupsGetResponse'

    handlePreLoad = () => {
    }

    handleAfterLoad = () => {
    }

    handleSuccess = (response) => {
        const searchResults = response.results;
        this.parent.setState({ searchResults });
    }

    handleFailure = () => {
    }

    handleFatal = () => {
    }

    init = (query) => {
        this.createDefault({
            url: createUrlForUsersAndUserGroups(query),
            params: createParamsForGet(),
        });
    }
}
