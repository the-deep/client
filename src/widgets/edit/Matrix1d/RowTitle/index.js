import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import { FaramErrorIndicatorElement } from '#rscg/FaramElements';

import { iconNames } from '#constants';

import _ts from '#ts';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedRow: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
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
        const key = this.props.keyExtractor(data);
        this.props.setSelectedRow(key);
    }

    faramInfoForDelete = {
        action: 'remove',
        callback: (i, newValue) => {
            const newIndex = Math.min(i, newValue.length - 1);
            const newKey = newIndex !== -1
                ? this.props.keyExtractor(newValue[newIndex])
                : undefined;
            this.props.setSelectedRow(newKey);
        },
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const rowTitleClassNames = [styles.rowTitle];
        const titleClassNames = [styles.title];
        if (isSelected) {
            rowTitleClassNames.push(styles.active);
        }
        if (hasError) {
            titleClassNames.push(styles.hasError);
        }

        return (
            <div className={rowTitleClassNames.join(' ')}>
                <button
                    className={titleClassNames.join(' ')}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || _ts('widgets.editor.matrix1d', 'unnamedRowTitle', { index: index + 1 })}
                </button>
                <DangerButton
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix1d', 'deleteButtonTooltip')}
                    iconName={iconNames.delete}
                    transparent
                    faramInfo={this.faramInfoForDelete}
                    faramElementIndex={index}
                />
            </div>
        );
    }
}
