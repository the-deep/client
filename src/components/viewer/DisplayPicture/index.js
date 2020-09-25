import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import InternalGallery from '#components/viewer/InternalGallery';
import GalleryImage from '#components/viewer/GalleryViewer/Preview/GalleryImage';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
    url: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
    url: undefined,
};

export default class DisplayPicture extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            galleryId,
            url,
        } = this.props;

        if (url) {
            return (
                <GalleryImage
                    className={_cs(className, styles.displayPicture)}
                    imageUrl={url}
                    imageClassName={styles.image}
                />
            );
        }

        if (galleryId) {
            return (
                <InternalGallery
                    className={_cs(className, styles.displayPicture)}
                    galleryId={galleryId}
                    imageClassName={styles.image}
                />
            );
        }

        return (
            <Icon
                className={_cs(className, styles.defaultUser)}
                name="defaultUser"
            />
        );
    }
}
