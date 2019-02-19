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
    setSelectedSector: PropTypes.func.isRequired,
    hasError: PropTypes.bool,
    keySelector: PropTypes.func.isRequired,
};
const defaultProps = {
    data: {},
    isSelected: false,
    hasError: false,
};

@FaramErrorIndicatorElement
export default class SectorTitle extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            data,
            keySelector,
            setSelectedSector,
        } = this.props;
        const id = keySelector(data);
        setSelectedSector(id);
    }

    deleteClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);

        const {
            keySelector,
            setSelectedSector,
        } = this.props;
        const newIndex = Math.min(index, newOptions.length - 1);
        const newKey = newIndex !== -1
            ? keySelector(newOptions[newIndex])
            : undefined;
        setSelectedSector(newKey);

        return newOptions;
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
        } = this.props;

        const sectorTitleClassName = _cs(
            styles.sectorTitle,
            isSelected && styles.active,
        );

        const titleClassName = _cs(
            styles.title,
            hasError && styles.hasError,
        );

        return (
            <div className={sectorTitleClassName}>
                <button
                    className={titleClassName}
                    onClick={this.handleClick}
                    type="button"
                >
                    {title || _ts('widgets.editor.matrix2d', 'unnamedSectorTitle', { index: index + 1 })}
                </button>
                <DangerButton
                    faramAction={this.deleteClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix2d', 'deleteSectorTooltip')}
                    iconName={iconNames.delete}
                    transparent
                />
            </div>
        );
    }
}
