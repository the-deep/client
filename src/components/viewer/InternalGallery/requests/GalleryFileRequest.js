import Request from '#utils/Request';

import {
    createUrlForGalleryFile,
    createParamsForGet,
} from '#rest';

export default class GalleryFileRequest extends Request {
    schemaName = 'galleryFile';

    handlePreLoad = () => {
        this.parent.setState({
            pending: true,
            notFound: true,
        });
    }

    handlePostLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setState({
            fileUrl: response.file,
            fileName: response.title,
            mimeType: response.mimeType,
            notFound: false,
        });

        this.parent.notifyMimeType(response.mimeType);
    }

    init = (galleryId) => {
        this.createDefault({
            url: createUrlForGalleryFile(galleryId),
            params: createParamsForGet(),
        });

        return this;
    }
}
