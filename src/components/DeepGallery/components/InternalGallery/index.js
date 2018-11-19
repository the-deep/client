import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '#constants';
import _ts from '#ts';

import GalleryViewer from '../GalleryViewer';

import GalleryFileRequest from './requests/GalleryFileRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
    onlyFileName: PropTypes.bool,
    pendingLabel: PropTypes.string,
    notFoundMessage: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
    onlyFileName: false,
    pendingLabel: undefined,
    notFoundMessage: undefined,
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

    renderFileName = ({ className, fileName, fileUrl }) => (
        <a
            className={`${styles.galleryFileName} ${className}`}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
        >
            {fileName}
        </a>
    )

    renderPending = () => {
        const { className, pendingLabel, onlyFileName } = this.props;

        // FIXME: use LoadingAnimation small here
        // XXX: what does onlyFileName do?
        return (
            <div className={`${styles.pendingContainer} ${onlyFileName ? styles.fileName : ''} ${className}`}>
                {
                    onlyFileName &&
                    <span className={styles.label} >
                        { pendingLabel || _ts('components.internalGallery', 'loadingFileLabel') }
                    </span>
                }
                <span className={`${iconNames.loading} ${styles.loadingAnimation}`} />
            </div>
        );
    }

    render404 = () => {
        const { className, onlyFileName, notFoundMessage } = this.props;

        return (
            <div className={`${styles.show404} ${onlyFileName ? styles.fileName : ''} ${className}`}>
                <span className={styles.label}>
                    {notFoundMessage || _ts('components.internalGallery', 'deepFileNotFound')}
                </span>
            </div>
        );
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
            className,
            onlyFileName,
        } = this.props;

        if (pending) {
            // show pending
            return this.renderPending();
        }

        if (notFound) {
            // show 404 message
            return this.render404();
        }

        if (onlyFileName) {
            // show file name only
            return this.renderFileName({ className, fileName, fileUrl });
        }

        // use supported file viewer component
        return (
            <GalleryViewer
                {...this.props}
                className={className}
                url={fileUrl}
                mimeType={mimeType}
                canShowIframe
            />
        );
    }
}
