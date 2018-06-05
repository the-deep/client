// import schema from '#schema';
import Request from '#utils/Request';
import {
    createUrlForProjectList,
    createParamsForGet,
    // transformResponseErrorToFormError,
} from '#rest';
import { getFiltersForRequest } from '#entities/lead';

export default class ProjectListRequest extends Request {
    schemaName = 'projectsGetResponse'

    handlePreLoad = () => {
        this.parent.setState({ pendingProjectList: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectList: false });
    }

    handleSuccess = (response) => {
        this.parent.setProjectList({
            projectList: response.results,
            totalProjectsCount: response.count,
        });
    }

    init = ({
        activeSort,
        filters,
        activePage,
        projectsPerPage,
    }) => {
        const sanitizedFilters = getFiltersForRequest(filters);
        const projectListRequestOffset = (activePage - 1) * projectsPerPage;
        const projectListRequestLimit = projectsPerPage;

        const urlForProjectList = createUrlForProjectList({
            ...sanitizedFilters,
            ordering: activeSort,
            offset: projectListRequestOffset,
            limit: projectListRequestLimit,
        });

        this.createDefault({
            url: urlForProjectList,
            params: createParamsForGet,
        });
    }
}

