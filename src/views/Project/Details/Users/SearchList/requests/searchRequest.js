import Request from '#utils/Request';

import {
    createUrlForUsersAndUserGroups,
    createParamsForGet,
} from '#rest';

export default class SearchRequest extends Request {
    schemaName = 'usersAndUserGroupsGetResponse'

    handlePreLoad = () => {
        this.parent.setState({ searchPending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ searchPending: false });
    }

    handleSuccess = (response) => {
        const { results: userList } = response;
        this.parent.setState({ userList });
    }

    init = (searchText) => {
        this.createDefault({
            url: createUrlForUsersAndUserGroups(searchText),
            params: createParamsForGet(),
        });

        return this;
    }
}
