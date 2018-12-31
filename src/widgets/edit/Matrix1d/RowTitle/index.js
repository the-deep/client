import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import { FaramErrorIndicatorElement } from '#rscg/FaramElements';

import { iconNames } from '#constants';

import _ts from '#ts';
import _cs from '#cs';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedRow: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keySelector: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramErrorIndicatorElement
export default class RowTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const { data } = this.props;
        const key = this.props.keySelector(data);
        this.props.setSelectedRow(key);
    }

    deleteClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);

        const newIndex = Math.min(index, newOptions.length - 1);
        const newKey = newIndex !== -1
            ? this.props.keySelector(newOptions[newIndex])
            : undefined;
        this.props.setSelectedRow(newKey);

        return newOptions;
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const rowTitleClassName = _cs(
            styles.rowTitle,
            isSelected && styles.active,
        );

        const titleClassName = _cs(
            styles.title,
            hasError && styles.hasError,
        );

        return (
            <div className={rowTitleClassName}>
                <button
                    className={titleClassName}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || _ts('widgets.editor.matrix1d', 'unnamedRowTitle', { index: index + 1 })}
                </button>
                <DangerButton
                    faramAction={this.deleteClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix1d', 'deleteButtonTooltip')}
                    iconName={iconNames.delete}
                    transparent
                />
            </div>
        );
    }
}
