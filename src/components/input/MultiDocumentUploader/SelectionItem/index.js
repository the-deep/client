import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import NumberInput from '#rsci/NumberInput';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import _ts from '#ts';

import InternalGalleryModal from '#components/viewer/InternalGalleryModal';
import ExternalGalleryModal from '#components/viewer/ExternalGalleryModal';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    selectionKey: PropTypes.string.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onStartPageChange: PropTypes.func.isRequired,
    attachment: PropTypes.number.isRequired,
    onEndPageChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    name: PropTypes.string.isRequired,
    // showPageRange: PropTypes.bool.isRequired,
    startPage: PropTypes.number.isRequired,
    endPage: PropTypes.number,
    type: PropTypes.string,
    url: PropTypes.string,
};

const defaultProps = {
    className: '',
    type: 'url',
    disabled: false,
    readOnly: false,
    endPage: undefined,
    url: undefined,
};

const ModalButton = modalize(Button);

export default class Selection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleRemoveClick = () => {
        const {
            selectionKey,
            onRemoveClick,
        } = this.props;
        onRemoveClick(selectionKey);
    }

    handleStartPageChange = (value) => {
        const {
            selectionKey,
            onStartPageChange,
        } = this.props;
        onStartPageChange(selectionKey, value);
    }

    handleEndPageChange = (value) => {
        const {
            selectionKey,
            onEndPageChange,
        } = this.props;
        onEndPageChange(selectionKey, value);
    }

    render() {
        const {
            className: classNameFromProps,
            disabled,
            readOnly,
            // showPageRange,

            type,

            name,
            url,

            attachment,

            startPage,
            endPage,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.selectionItem,
            'multi-document-upload-selection-item',
        );

        return (
            <div className={className}>
                <div className={styles.top}>
                    { type === 'file' && attachment && (
                        <ModalButton
                            className={styles.documentLink}
                            transparent
                            title={attachment.title}
                            modal={
                                <InternalGalleryModal
                                    attachment={attachment}
                                    showUrl
                                    name={attachment.title}
                                />
                            }
                        >
                            { attachment.title }
                        </ModalButton>
                    )}
                    {type === 'url' && (
                        <ModalButton
                            className={styles.documentLink}
                            transparent
                            title={name}
                            modal={
                                <ExternalGalleryModal
                                    url={url}
                                    showUrl
                                    name={name}
                                />
                            }
                        >
                            {name}
                        </ModalButton>
                    )}
                    <DangerButton
                        className={styles.removeButton}
                        iconName="close"
                        onClick={this.handleRemoveClick}
                        disabled={disabled || readOnly}
                        title={_ts('components.multiDocumentUploader', 'removeButtonLabel')}
                        transparent
                    />
                </div>
                { type === 'file' && (
                    <div className={styles.pageRange}>
                        <NumberInput
                            className={styles.startPageInput}
                            value={startPage}
                            onChange={this.handleStartPageChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            label={_ts('components.multiDocumentUploader', 'startPageLabel')}
                            separator=" "
                        />
                        <NumberInput
                            value={endPage}
                            onChange={this.handleEndPageChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            label={_ts('components.multiDocumentUploader', 'endPageLabel')}
                            separator=" "
                        />
                    </div>
                )}
            </div>
        );
    }
}
