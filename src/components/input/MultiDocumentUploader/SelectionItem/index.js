// import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import NumberInput from '#rsci/NumberInput';
import iconNames from '#rsk/iconNames';

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
            disabled,
            readOnly,
            url,
            name,
            showPageRange,
            startPage,
            endPage,
        } = this.props;

        return (
            <div className={styles.selection}>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    { name }
                </a>
                { showPageRange &&
                    <div className={styles.pageRange}>
                        <NumberInput
                            className={styles.page}
                            value={startPage}
                            onChange={this.handleStartPageChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            hint="Start Page"
                            separator=" "
                        />
                        <span className={styles.separator}>
                            to
                        </span>
                        <NumberInput
                            className={styles.page}
                            value={endPage}
                            onChange={this.handleEndPageChange}
                            disabled={disabled}
                            readOnly={readOnly}
                            hint="End Page"
                            separator=" "
                        />
                    </div>
                }
                <DangerButton
                    className={styles.action}
                    iconName={iconNames.close}
                    onClick={this.handleRemoveClick}
                    disabled={disabled || readOnly}
                    title="Remove"
                    transparent
                />
            </div>
        );
    }
}
