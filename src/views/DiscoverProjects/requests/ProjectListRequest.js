// import schema from '#schema';
import Request from '#utils/Request';
import {
    urlForProjectList,
    createParamsForGet,
    // transformResponseErrorToFormError,
} from '#rest';

export default class ProjectListRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingProjectList: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectList: false });
    }

    handleSuccess = (response) => {
        this.parent.setProjectList({
            projectList: response.results,
        });
    }

    create = () => {
        this.createDefault({
            url: urlForProjectList,
            createParams: createParamsForGet,
        });
    }
}

