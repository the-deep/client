import PropTypes from 'prop-types';
import React from 'react';
import { FaramErrorIndicatorElement } from '@togglecorp/faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';

import _ts from '#ts';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    isSelected: PropTypes.bool,
    index: PropTypes.number.isRequired,
    hasError: PropTypes.bool,
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

    deleteClick = (options, index) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);

        return newOptions;
    }

    render() {
        const {
            index,
            data: { title },
            isSelected,
            hasError,
            onEditButtonClick,
            className,
        } = this.props;

        const sectorTitleClassName = _cs(
            styles.sectorTitle,
            className,
        );

        const titleClassName = _cs(
            styles.title,
            hasError && styles.hasError,
        );

        return (
            <div className={sectorTitleClassName}>
                <div className={titleClassName}>
                    {title || _ts('widgets.editor.matrix2d', 'unnamedSectorTitle', { index: index + 1 })}
                </div>
                <Button
                    transparent
                    className={styles.editButton}
                    onClick={onEditButtonClick}
                    iconName="edit"
                />
                <DangerButton
                    faramAction={this.deleteClick}
                    faramElementName={index}
                    className={styles.deleteButton}
                    title={_ts('widgets.editor.matrix2d', 'deleteSectorTooltip')}
                    iconName="delete"
                    transparent
                />
            </div>
        );
    }
}
