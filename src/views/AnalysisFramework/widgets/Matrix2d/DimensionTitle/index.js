import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import FaramElement from '#rs/components/Input/Faram/FaramElement';

import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedDimension: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramElement('errorIndicator')
export default class DimensionTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            data,
            keyExtractor,
            setSelectedDimension,
        } = this.props;

        const id = keyExtractor(data);
        setSelectedDimension(id);
    }

    faramInfoForDelete = {
        callback: (i, newValue) => {
            const {
                keyExtractor,
                setSelectedDimension,
            } = this.props;
            const newIndex = Math.min(i, newValue.length - 1);
            const newKey = newIndex !== -1
                ? keyExtractor(newValue[newIndex])
                : undefined;
            setSelectedDimension(newKey);
        },
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const dimensionTitleClassNames = [styles.dimensionTitle];
        const titleClassNames = [styles.title];
        if (isSelected) {
            dimensionTitleClassNames.push(styles.active);
        }
        if (hasError) {
            titleClassNames.push(styles.hasError);
        }

        const defaultTitle = `Dimension ${index + 1}`;

        return (
            <div className={dimensionTitleClassNames.join(' ')}>
                <button
                    className={titleClassNames.join(' ')}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || defaultTitle}
                </button>
                <DangerButton
                    className={styles.deleteButton}
                    // FIXME: use strings
                    title="Remove Dimension"
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
