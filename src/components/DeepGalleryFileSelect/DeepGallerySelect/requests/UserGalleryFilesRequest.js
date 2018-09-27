import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

import {
    createUrlForGalleryFiles,
    createParamsForGet,
} from '#rest';

/*
 * - setState
 * - setUserGalleryFiles
*/
export default class UserGalleryFilesRequest extends Request {
    schemaName = 'galleryFilesGetResponse';

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setUserGalleryFiles({
            galleryFiles: response.results,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('components.deepGallerySelect', 'modalTitle'),
            type: notify.type.ERROR,
            message: _ts('components.deepGallerySelect', 'fileGetFailure'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setState({ pending: false });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('components.deepGallerySelect', 'modalTitle'),
            type: notify.type.ERROR,
            message: _ts('components.deepGallerySelect', 'fileGetFatal'),
            duration: notify.duration.MEDIUM,
        });
        this.parent.setState({ pending: false });
    }

    init = (params) => {
        this.createDefault({
            url: createUrlForGalleryFiles(params),
            params: createParamsForGet(),
        });

        return this;
    }
}
