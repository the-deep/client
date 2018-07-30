import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rsca/Button/DangerButton';
import FaramElement from '#rsci/Faram/FaramElement';

import { iconNames } from '#constants';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    setSelectedSector: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keyExtractor: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramElement('errorIndicator')
export default class SectorTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            data,
            keyExtractor,
            setSelectedSector,
        } = this.props;
        const id = keyExtractor(data);
        setSelectedSector(id);
    }

    faramInfoForDelete = {
        callback: (i, newValue) => {
            const {
                keyExtractor,
                setSelectedSector,
            } = this.props;
            const newIndex = Math.min(i, newValue.length - 1);
            const newKey = newIndex !== -1
                ? keyExtractor(newValue[newIndex])
                : undefined;
            setSelectedSector(newKey);
        },
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const sectorTitleClassNames = [styles.sectorTitle];
        const titleClassNames = [styles.title];
        if (isSelected) {
            sectorTitleClassNames.push(styles.active);
        }
        if (hasError) {
            titleClassNames.push(styles.hasError);
        }

        const defaultTitle = `Sector ${index + 1}`;

        return (
            <div className={sectorTitleClassNames.join(' ')}>
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
                    title="Remove Sector"
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
