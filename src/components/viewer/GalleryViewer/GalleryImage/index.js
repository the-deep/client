import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import _ts from '#ts';

import styles from './styles.scss';

export { galleryImageMimeType as supportedMimeType } from '#config/deepMimeTypes';

const propTypes = {
    className: PropTypes.string,
    imageUrl: PropTypes.string,
    imageClassName: PropTypes.string,
};

const defaultProps = {
    className: '',
    imageUrl: undefined,
    imageClassName: undefined,
};

/*
 * Gallery viewer component for Images [galleryImageMimeType]
 */
export default class GalleryImage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            imageClassName,
            imageUrl,
        } = this.props;

        return (
            <div className={_cs('gallery-image', styles.galleryImage, className)}>
                {
                    imageUrl ? (
                        <img
                            alt={_ts('components.galleryImage', 'altUser')}
                            className={_cs('image', styles.image, imageClassName)}
                            src={imageUrl}
                        />
                    ) : (
                        <Icon
                            className={_cs('image-alt', styles.imageAlt)}
                            name="user"
                        />
                    )
                }
            </div>
        );
    }
}
