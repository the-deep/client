import PropTypes from 'prop-types';
import React from 'react';
import { FaramErrorIndicatorElement } from '@togglecorp/faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    index: PropTypes.number.isRequired,
    hasError: PropTypes.bool,
    dimensionKey: PropTypes.string.isRequired,
    onEditButtonClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    data: {},
    hasError: false,
};

@FaramErrorIndicatorElement
export default class DimensionTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDeleteButtonClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);

        return newOptions;
    }

    handleEditButtonClick = () => {
        const {
            onEditButtonClick,
            dimensionKey,
        } = this.props;

        onEditButtonClick(dimensionKey);
    }

    render() {
        const {
            index,
            data: { title },
            hasError,
            className,
        } = this.props;

        const titleClassName = _cs(
            styles.title,
            hasError && styles.hasError,
        );

        return (
            <div className={_cs(styles.dimensionTitle, className)}>
                <div className={titleClassName}>
                    {title || _ts('widgets.editor.matrix2d', 'unnamedDimensionLabel', { index: index + 1 })}
                </div>
                <Button
                    transparent
                    className={styles.editButton}
                    onClick={this.handleEditButtonClick}
                    iconName="edit"
                />
                <DangerButton
                    faramAction={this.handleDeleteButtonClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix2d', 'removeDimensionTooltip')}
                    iconName="delete"
                    transparent
                />
            </div>
        );
    }
}
