import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import Message from '#rscv/Message';
import _ts from '#ts';

import GalleryViewer from '../GalleryViewer';

import styles from './styles.scss';

const PreviewNothing = ({
    className, notFound, notFoundMessage, fileUrl, fileName,
}) => {
    if (notFound) {
        return (
            <div className={_cs(styles.previewNothing, className)}>
                {notFoundMessage || _ts('components.internalGallery', 'deepFileNotFound')}
            </div>
        );
    }
    // show file name only
    return (
        <a
            className={_cs(styles.galleryFileName, className)}
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
    notFoundMessage: PropTypes.string,
    notFound: PropTypes.bool,
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
};
PreviewNothing.defaultProps = {
    className: '',
    notFoundMessage: undefined,
    notFound: false,
    fileUrl: '',
    fileName: '',
};

const PreviewGallery = ({
    className,
    notFound,
    notFoundMessage,
    fileUrl,
    mimeType,
    ...otherProps
}) => {
    if (notFound) {
        return (
            <div className={_cs(className, styles.previewGallery)}>
                <Message>
                    {notFoundMessage || _ts('components.internalGallery', 'deepFileNotFound')}
                </Message>
            </div>
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
    fileUrl: PropTypes.string,
    mimeType: PropTypes.string,
};
PreviewGallery.defaultProps = {
    className: '',
    notFoundMessage: undefined,
    notFound: false,
    fileUrl: '',
    mimeType: undefined,
};


const propTypes = {
    attachment: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onlyFileName: PropTypes.bool,
    onMimeTypeGet: PropTypes.func,
    renderer: PropTypes.func,
};

const defaultProps = {
    attachment: undefined,
    onlyFileName: false,
    onMimeTypeGet: undefined,
    renderer: undefined,
};

function InternalGallery(props) {
    const {
        attachment,
        onlyFileName,
        renderer,
        ...otherProps
    } = props;

    let Preview = onlyFileName ? PreviewNothing : PreviewGallery;
    if (renderer) {
        Preview = renderer;
    }

    if (!attachment) {
        return (
            <Preview
                {...otherProps}
                notFound
            />
        );
    }

    const {
        title,
        file,
        mimeType,
    } = attachment;
    return (
        <Preview
            {...otherProps}
            fileName={title}
            fileUrl={file}
            mimeType={mimeType}
        />
    );
}

InternalGallery.propTypes = propTypes;
InternalGallery.defaultProps = defaultProps;

export default InternalGallery;
