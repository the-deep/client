import PropTypes from 'prop-types';
import React from 'react';

import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import { iconNames } from '#constants';
import _ts from '#ts';

import GalleryViewer from '../GalleryViewer';

import GalleryFileRequest from './requests/GalleryFileRequest';

import styles from './styles.scss';

const PreviewNothing = ({
    pending, pendingLabel, className, notFound, notFoundMessage, fileUrl, fileName,
}) => {
    if (pending) {
        return (
            <div className={`${styles.previewNothing} ${className}`}>
                <span className={styles.label} >
                    { pendingLabel || _ts('components.internalGallery', 'loadingFileLabel') }
                </span>
                <span className={`${iconNames.loading} ${styles.loadingAnimation}`} />
            </div>
        );
    }
    if (notFound) {
        return (
            <div className={`${styles.previewNothing} ${className}`}>
                {notFoundMessage || _ts('components.internalGallery', 'deepFileNotFound')}
            </div>
        );
    }
    // show file name only
    return (
        <a
            className={`${styles.galleryFileName} ${className}`}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
        >
            {fileName}
        </a>
    );
};
PreviewNothing.propTypes = {
    className: PropTypes.string,
    pendingLabel: PropTypes.string,
    notFoundMessage: PropTypes.string,
    notFound: PropTypes.bool,
    pending: PropTypes.bool,
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
};
PreviewNothing.defaultProps = {
    className: '',
    pendingLabel: undefined,
    notFoundMessage: undefined,
    notFound: false,
    pending: false,
    fileUrl: '',
    fileName: '',
};

const PreviewGallery = ({
    pending, className, notFound, notFoundMessage, fileUrl, mimeType, ...otherProps
}) => {
    if (pending) {
        return (
            <div className={`${className} ${styles.previewGallery}`}>
                <LoadingAnimation />
            </div>
        );
    }
    if (notFound) {
        return (
            <Message className={`${className} ${styles.previewGallery}`}>
                {notFoundMessage || _ts('components.internalGallery', 'deepFileNotFound')}
            </Message>
        );
    }
    // use supported file viewer component
    return (
        <GalleryViewer
            {...otherProps}
            className={className}
            url={fileUrl}
            mimeType={mimeType}
            canShowIframe
        />
    );
};
PreviewGallery.propTypes = {
    className: PropTypes.string,
    notFoundMessage: PropTypes.string,
    notFound: PropTypes.bool,
    pending: PropTypes.bool,
    fileUrl: PropTypes.string,
    mimeType: PropTypes.string,
};
PreviewGallery.defaultProps = {
    className: '',
    notFoundMessage: undefined,
    notFound: false,
    pending: false,
    fileUrl: '',
    mimeType: undefined,
};


const propTypes = {
    galleryId: PropTypes.number,
    onlyFileName: PropTypes.bool,
    onMimeTypeGet: PropTypes.func,
};

const defaultProps = {
    galleryId: undefined,
    onlyFileName: false,
    onMimeTypeGet: undefined,
};

export default class InternalGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            fileUrl: undefined,
            fileName: undefined,
            notFound: true,
        };

        this.galleryFileRequest = new GalleryFileRequest({
            setState: params => this.setState(params),
            notifyMimeType: (mimeType) => {
                const { onMimeTypeGet } = this.props;
                if (onMimeTypeGet) {
                    onMimeTypeGet(mimeType);
                }
            },
        });
    }

    componentWillMount() {
        this.startGalleryFileRequest(this.props.galleryId);
    }

    componentWillReceiveProps(nextProps) {
        const { galleryId: oldGalleryId } = this.props;
        const { galleryId: newGalleryId } = nextProps;
        if (oldGalleryId !== newGalleryId) {
            this.startGalleryFileRequest(newGalleryId);
        }
    }

    componentWillUnmount() {
        if (this.galleryFileRequest) {
            this.galleryFileRequest.stop();
        }
    }

    startGalleryFileRequest = (galleryId) => {
        if (!galleryId) {
            this.setState({ notFound: true, pending: false });
            return;
        }
        this.galleryFileRequest.init(this.props.galleryId).start();
    }

    render() {
        const {
            pending,
            fileUrl,
            fileName,
            mimeType,
            notFound,
        } = this.state;

        const {
            galleryId, // eslint-disable-line no-unused-vars
            onlyFileName,
            ...otherProps
        } = this.props;

        const Preview = onlyFileName ? PreviewNothing : PreviewGallery;

        return (
            <Preview
                {...otherProps}
                pending={pending}
                notFound={notFound}

                fileName={fileName}
                fileUrl={fileUrl}
                mimeType={mimeType}
            />
        );
    }
}
