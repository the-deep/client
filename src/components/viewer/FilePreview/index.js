import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Image from '#rscv/Image';
import Message from '#rscv/Message';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fileUrl: PropTypes.string,
    fileName: PropTypes.string,
    format: PropTypes.string,
    notFound: PropTypes.bool,
    pending: PropTypes.bool,
};

const defaultProps = {
    className: '',
    fileUrl: undefined,
    fileName: '',
    format: 'png',
    notFound: false,
    pending: false,
};

export default class FilePreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            format,
            fileUrl,
            pending,
            notFound,
            fileName,
        } = this.props;

        if (pending) {
            return (
                <div className={_cs(styles.notFound, className)}>
                    <Message>
                        {_ts('components.internalGallery', 'loadingFileLabel')}
                    </Message>
                </div>
            );
        }

        if (!notFound && (format === 'png' || format === 'svg')) {
            return (
                <Image
                    className={className}
                    imageClassName={styles.image}
                    src={fileUrl}
                    alt={fileName}
                    zoomable
                />
            );
        }

        return (
            <div className={_cs(styles.notFound, className)}>
                <Message>
                    {notFound
                        ? _ts('components.viewer.fileImagePreview', 'notFoundTitle')
                        : _ts('components.viewer.fileImagePreview', 'notSupportedTitle')
                    }
                </Message>
            </div>
        );
    }
}
