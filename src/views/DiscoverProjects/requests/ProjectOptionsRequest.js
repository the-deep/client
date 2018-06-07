// import schema from '#schema';
import Request from '#utils/Request';
import {
    urlForProjectOptions,
    createParamsForGet,
} from '#rest';

export default class ProjectOptionsRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ pendingProjectOptions: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pendingProjectOptions: false });
    }

    handleSuccess = (response) => {
        // FIXME: write schema
        this.parent.setProjectOptions(response);
    }

    init = () => {
        this.createDefault({
            url: urlForProjectOptions,
            params: createParamsForGet,
        });
    }
}

