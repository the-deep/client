import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import modalize from '#rscg/Modalize';
import HealthBar from '#rscz/HealthBar';

import Cloak from '#components/general/Cloak';
import { DATA_TYPE } from '#entities/tabular';
import _ts from '#ts';

import FieldEditModal from './FieldEditModal';
import styles from './styles.scss';

const WarningModalButton = modalize(WarningButton);

const getSortIcon = sortOrder => ({
    asc: 'sortAscending',
    dsc: 'sortDescending',
})[sortOrder] || 'sort';

const healthColorScheme = [
    '#41cf76',
    '#f44336',
    '#ef8c00',
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
        viewMode: PropTypes.bool,
        highlight: PropTypes.shape({
            color: PropTypes.string,
        }),
        projectRegions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    };

    static defaultProps = {
        sortOrder: undefined,
        disabled: false,
        disabledDelete: false,
        isFieldDeletePending: false,
        isFieldEditPending: false,
        filterValue: undefined,
        viewMode: false,
        projectRegions: {},
        highlight: undefined,
    };

    shouldHideEditButton = ({ leadPermissions }) => (
        this.props.viewMode || !leadPermissions.modify
    );

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
            projectRegions,

            highlight,
        } = this.props;

        const style = {
            borderTop: '3px solid transparent',
        };

        if (highlight) {
            style.borderTop = `3px solid ${highlight.color}`;
        }

        const iconNameMapping = {
            [DATA_TYPE.string]: 'stringIcon',
            [DATA_TYPE.number]: 'numericalIcon',
            [DATA_TYPE.geo]: 'globe',
            [DATA_TYPE.datetime]: 'dateIcon',
        };

        const icon = iconNameMapping[value.type];

        return (
            <div
                className={styles.header}
                style={style}
            >
                <div className={styles.top}>
                    { icon &&
                        <Icon
                            className={styles.icon}
                            name={icon}
                        />
                    }
                    <Button
                        className={styles.sortButton}
                        onClick={this.handleSortClick}
                        iconName={getSortIcon(sortOrder)}
                        transparent
                        disabled={disabled}
                        smallVerticalPadding
                    />
                    <div
                        title={value.title}
                        className={styles.title}
                    >
                        {value.title}
                    </div>
                    <Cloak
                        hide={this.shouldHideEditButton}
                        render={
                            <WarningModalButton
                                className={styles.editButton}
                                iconName="edit"
                                transparent
                                title={_ts('tabular.header', 'columnEditButtonTooltip')}
                                disabled={disabled}
                                smallVerticalPadding
                                pending={isFieldDeletePending || isFieldEditPending}
                                modal={
                                    <FieldEditModal
                                        disabled={disabled}
                                        disabledDelete={disabledDelete}
                                        fieldId={fieldId}
                                        value={value}
                                        onFieldDelete={onFieldDelete}
                                        onFieldEdit={onFieldEdit}
                                        projectRegions={projectRegions}
                                    />
                                }
                            />
                        }
                    />
                </div>
                <Filter
                    className={styles.searchInput}
                    disabled={disabled}
                    value={filterValue}
                    onChange={this.handleFilterChange}
                />
                <HealthBar
                    data={statusData}
                    valueSelector={healthBarValueSelector}
                    keySelector={healthBarKeySelector}
                    labelSelector={healthBarKeySelector}
                    className={styles.healthBar}
                    centerTooltip
                    hideLabel
                    enlargeOnHover={false}
                    colorScheme={healthColorScheme}
                />
            </div>
        );
    }
}

