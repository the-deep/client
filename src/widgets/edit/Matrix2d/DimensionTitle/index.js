import PropTypes from 'prop-types';
import React from 'react';
import { FaramErrorIndicatorElement } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';

import { iconNames } from '#constants';
import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedDimension: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keySelector: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramErrorIndicatorElement
export default class DimensionTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            data,
            keySelector,
            setSelectedDimension,
        } = this.props;

        const id = keySelector(data);
        setSelectedDimension(id);
    }

    deleteClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);

        const {
            keySelector,
            setSelectedDimension,
        } = this.props;
        const newIndex = Math.min(index, newOptions.length - 1);
        const newKey = newIndex !== -1
            ? keySelector(newOptions[newIndex])
            : undefined;
        setSelectedDimension(newKey);

        return newOptions;
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const dimensionTitleClassName = _cs(
            styles.dimensionTitle,
            isSelected && styles.active,
        );

        const titleClassName = _cs(
            styles.title,
            hasError && styles.hasError,
        );

        return (
            <div className={dimensionTitleClassName}>
                <button
                    className={titleClassName}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || _ts('widgets.editor.matrix2d', 'unnamedDimensionLabel', { index: index + 1 })}
                </button>
                <DangerButton
                    faramAction={this.deleteClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix2d', 'removeDimensionTooltip')}
                    iconName={iconNames.delete}
                    transparent
                />
            </div>
        );
    }
}
