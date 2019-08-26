import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import InternalGallery from '#components/viewer/InternalGallery';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
};

export default class DisplayPicture extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            galleryId,
        } = this.props;

        if (galleryId) {
            const classNames = `${className} ${styles.displayPicture}`;
            return (
                <InternalGallery
                    className={classNames}
                    galleryId={galleryId}
                    imageClassName={styles.image}
                />
            );
        }

        const classNames = `${className} ${styles.defaultUser}`;
        return (
            <Icon
                className={classNames}
                name="defaultUser"
            />
        );
    }
}
