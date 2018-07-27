import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rs/components/Action/Button';
import DangerButton from '#rs/components/Action/Button/DangerButton';

import { iconNames } from '#constants';

import RowHeading from './RowHeading';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedRow: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
};

export default class RowTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const { data: { key } } = this.props;
        this.props.setSelectedRow(key);
    }

    faramInfoForDelete = {
        callback: (i, newValue) => {
            const newIndex = Math.min(i, newValue.length - 1);
            const newKey = newIndex !== -1 ? newValue[newIndex].key : undefined;
            this.props.setSelectedRow(newKey);
        },
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
        } = this.props;
        return (
            <div className={styles.rowTitle}>
                <Button
                    className={styles.title}
                    onClick={this.handleClick}
                    transparent
                >
                    <RowHeading
                        title={title}
                        index={index}
                        isSelected={isSelected}
                        faramElementName={String(index)}
                    />
                </Button>
                <DangerButton
                    className={styles.deleteButton}
                    // FIXME: use strings
                    title="Remove Row"
                    iconName={iconNames.delete}
                    transparent
                    faramAction="remove"
                    faramInfo={this.faramInfoForDelete}
                    faramElementIndex={index}
                />
            </div>
        );
    }
}
