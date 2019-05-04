import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Image from '#rscv/Image';
import Message from '#rscv/Message';
import { createUrlForGalleryFilePreview } from '#rest';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    fileId: PropTypes.number,
    format: PropTypes.string,
};

const defaultProps = {
    className: '',
    fileId: undefined,
    format: 'png',
};

export default class FilePreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            format,
            fileId,
        } = this.props;

        if (fileId && (format === 'png' || format === 'svg')) {
            return (
                <Image
                    className={className}
                    imageClassName={
                        _cs(
                            styles.image,
                            format === 'svg' && styles.svgImage,
                        )
                    }
                    src={createUrlForGalleryFilePreview(fileId)}
                    alt=""
                    zoomable
                />
            );
        }

        return (
            <div className={_cs(styles.notFound, className)}>
                <Message>
                    {!fileId
                        ? _ts('components.viewer.fileImagePreview', 'notFoundTitle')
                        : _ts('components.viewer.fileImagePreview', 'notSupportedTitle')
                    }
                </Message>
            </div>
        );
    }
}
