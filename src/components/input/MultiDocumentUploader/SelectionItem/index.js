import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import NumberInput from '#rsci/NumberInput';
import iconNames from '#rsk/iconNames';
import _cs from '#cs';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    selectionKey: PropTypes.string.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onStartPageChange: PropTypes.func.isRequired,
    onEndPageChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    url: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    showPageRange: PropTypes.bool.isRequired,
    startPage: PropTypes.number.isRequired,
    endPage: PropTypes.number,
};

const defaultProps = {
    className: '',
    disabled: false,
    readOnly: false,
    endPage: undefined,
};

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
            url,
            name,
            showPageRange,
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
                    <a
                        className={styles.documentLink}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={name}
                    >
                        { name }
                    </a>
                    <DangerButton
                        className={styles.removeButton}
                        iconName={iconNames.close}
                        onClick={this.handleRemoveClick}
                        disabled={disabled || readOnly}
                        title={_ts('components.multiDocumentUploader', 'removeButtonLabel')}
                        transparent
                    />
                </div>
                { showPageRange && (
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
