import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import styles from './styles.scss';

function Image(props) {
    const {
        imageId,
        source,
        onImageClick,
        onDragStart,
    } = props;

    const handleImageClick = useCallback(() => {
        onImageClick(imageId);
    }, [onImageClick, imageId]);

    const handleDragStart = useCallback((e) => {
        onDragStart(imageId, source, e);
    }, [onDragStart, imageId, source]);

    return (
        <img
            key={imageId}
            alt={imageId}
            src={source}
            role="presentation"
            draggable
            className={styles.image}
            onClick={handleImageClick}
            onDragStart={handleDragStart}
        />
    );
}

Image.propTypes = {
    imageId: PropTypes.number.isRequired,
    source: PropTypes.string.isRequired,
    onImageClick: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
};

const propTypes = {
    images: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    images: [],
};

const imageKeySelector = d => d.id;

function ImagesGrid(props) {
    const {
        className,
        images,
    } = props;

    const [activeImageSource, setActiveImageSource] = useState(undefined);
    const [imageViewModalShow, setImageViewModalShow] = useState(false);

    const handleImageClick = useCallback((imageId) => {
        setActiveImageSource(imageId);
        setImageViewModalShow(true);
    }, []);

    const handleImagePreviewClose = useCallback(() => {
        setImageViewModalShow(false);
    }, []);

    const handleOnDragStart = useCallback((imageId, source, e) => {
        const data = JSON.stringify({
            type: 'image',
            data: imageId,
            imageDetails: {
                id: imageId,
                file: source,
            },
        });

        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const imageRendererParams = useCallback((key, data) => ({
        imageId: key,
        source: data.file,
        onImageClick: handleImageClick,
        onDragStart: handleOnDragStart,
    }), [handleImageClick, handleOnDragStart]);

    return (
        <div className={_cs(className, styles.imagesGrid)}>
            <ListView
                className={styles.images}
                keySelector={imageKeySelector}
                data={images}
                renderer={Image}
                rendererParams={imageRendererParams}
            />
            { imageViewModalShow &&
                <Modal
                    className={styles.imagePreview}
                    onClose={handleImagePreviewClose}
                    closeOnEscape
                >
                    <ModalHeader
                        title=""
                        className={styles.modalHeader}
                        rightComponent={
                            <PrimaryButton
                                className={styles.transparentBtn}
                                onClick={handleImagePreviewClose}
                                transparent
                                iconName="close"
                            />
                        }
                    />
                    <ModalBody className={styles.modalBody}>
                        <img
                            className={styles.previewImage}
                            src={activeImageSource}
                            alt={activeImageSource}
                        />
                    </ModalBody>
                </Modal>
            }
        </div>
    );
}

ImagesGrid.propTypes = propTypes;
ImagesGrid.defaultProps = defaultProps;

export default ImagesGrid;
