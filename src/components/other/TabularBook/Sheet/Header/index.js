import PropTypes from 'prop-types';
import React from 'react';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import modalize from '#rscg/Modalize';
import HealthBar from '#rscz/HealthBar';

import { iconNames } from '#constants';
import { DATA_TYPE } from '#entities/tabular';
import _cs from '#cs';
import _ts from '#ts';

import FieldEditModal from './FieldEditModal';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);

const getSortIcon = sortOrder => ({
    asc: iconNames.sortAscending,
    dsc: iconNames.sortDescending,
})[sortOrder] || iconNames.sort;

const healthColorScheme = [
    '#41cf76',
    '#f44336',
    '#dddddd',
];

const healthBarValueSelector = x => x.value;
const healthBarKeySelector = x => x.key;

export default class Header extends React.PureComponent {
    static propTypes = {
        fieldId: PropTypes.number.isRequired,
        value: PropTypes.shape({}).isRequired,
        filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        onSortClick: PropTypes.func.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        sortOrder: PropTypes.string,
        // eslint-disable-next-line react/forbid-prop-types
        statusData: PropTypes.array.isRequired,
        disabled: PropTypes.bool,
        disabledDelete: PropTypes.bool,
        filterComponent: PropTypes.func.isRequired,
        onFieldDelete: PropTypes.func.isRequired,
        onFieldEdit: PropTypes.func.isRequired,
        isFieldDeletePending: PropTypes.bool,
        isFieldEditPending: PropTypes.bool,
    };

    static defaultProps = {
        sortOrder: undefined,
        disabled: false,
        disabledDelete: false,
        isFieldDeletePending: false,
        isFieldEditPending: false,
        filterValue: undefined,
    };

    handleSortClick = () => {
        const { fieldId, onSortClick } = this.props;
        // NOTE: fieldId must be string for Taebul
        onSortClick(String(fieldId));
    }

    handleFilterChange = (value) => {
        const { fieldId, onFilterChange } = this.props;
        onFilterChange(fieldId, value);
    }

    render() {
        const {
            sortOrder,
            value,
            statusData,
            filterValue,
            filterComponent: Filter,
            fieldId,
            disabled,
            disabledDelete,
            isFieldDeletePending,
            isFieldEditPending,
            onFieldDelete,
            onFieldEdit,
        } = this.props;

        const iconNameMapping = {
            [DATA_TYPE.string]: iconNames.text,
            [DATA_TYPE.number]: iconNames.calculator,
            [DATA_TYPE.geo]: iconNames.globe,
            [DATA_TYPE.datetime]: iconNames.calendar,
        };
        const icon = iconNameMapping[value.type];

        return (
            <div className={styles.header}>
                <Button
                    className={styles.title}
                    onClick={this.handleSortClick}
                    iconName={getSortIcon(sortOrder)}
                    transparent
                    disabled={disabled}
                >
                    {value.title}
                </Button>
                { icon && <span className={_cs(icon, styles.icon)} /> }
                <WarningModalButton
                    iconName={iconNames.edit}
                    transparent
                    title={_ts('tabular.header', 'columnEditButtonTooltip')} // Edit
                    disabled={disabled}
                    pending={isFieldDeletePending || isFieldEditPending}
                    modal={
                        <FieldEditModal
                            disabled={disabled}
                            disabledDelete={disabledDelete}
                            fieldId={fieldId}
                            value={value}
                            onFieldDelete={onFieldDelete}
                            onFieldEdit={onFieldEdit}
                        />
                    }
                />
                <Filter
                    className={styles.searchBox}
                    disabled={disabled}
                    value={filterValue}
                    onChange={this.handleFilterChange}
                />
                <HealthBar
                    data={statusData}
                    valueSelector={healthBarValueSelector}
                    keySelector={healthBarKeySelector}
                    className={styles.healthBar}
                    hideLabel
                    enlargeOnHover={false}
                    colorScheme={healthColorScheme}
                />
            </div>
        );
    }
}

