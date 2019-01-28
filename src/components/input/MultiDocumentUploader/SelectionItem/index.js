// import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import NumberInput from '#rsci/NumberInput';
import iconNames from '#rsk/iconNames';
import _cs from '#cs';

import styles from './styles.scss';

export default class Selection extends React.PureComponent {
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
                        title="Remove"
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
                            label="Start Page"
                            separator=" "
                        />
                        <NumberInput
                            className={styles.endPageInput}
                            value={endPage}
                            onChange={this.handleEndPageChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            label="End Page"
                            separator=" "
                        />
                    </div>
                )}
            </div>
        );
    }
}
