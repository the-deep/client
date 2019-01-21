import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';

import TriggerAndPoll from '#components/general/TriggerAndPoll';
import { iconNames } from '#constants';

import HealthBar from '#rscz/HealthBar';

import _cs from '#cs';

import { DATA_TYPE } from '#entities/tabular';
import styles from './styles.scss';


const LoadingOnValid = ({ invalid }) => (!invalid && (
    <span className={styles.loadingContainer}>
        <LoadingAnimation />
    </span>
));

const getSortIcon = sortOrder => ({
    asc: iconNames.sortAscending,
    dsc: iconNames.sortDescending,
})[sortOrder] || iconNames.sort;

const shouldExtractGeo = ({ type, geodata }) => (
    type === DATA_TYPE.geo &&
    (!geodata || geodata.status !== 'success')
);
const shouldPollGeo = ({ type, geodata }) => (
    type === DATA_TYPE.geo &&
    (!geodata || geodata.status === 'pending')
);
const isValidGeo = ({ type, geodata }) => (
    type === DATA_TYPE.geo &&
    (geodata && geodata.status === 'success')
);

const healthColorScheme = [
    '#41cf76',
    '#f44336',
];

const healthBarValueSelector = x => x;
const healthBarKeySelector = (x, i) => `${x}-${i}`;

export default class Header extends React.PureComponent {
    static propTypes = {
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.shape({}).isRequired,
        filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        onSortClick: PropTypes.func.isRequired,
        onFilterChange: PropTypes.func.isRequired,
        sortOrder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        statusData: PropTypes.arrayOf(PropTypes.number).isRequired,
        disabled: PropTypes.bool,
        filterComponent: PropTypes.func.isRequired,
        // First value is valid count and the second is invalid count
    };

    static defaultProps = {
        sortOrder: undefined,
        disabled: false,
        filterValue: undefined,
    };

    handleSortClick = () => {
        this.props.onSortClick(this.props.columnKey);
    }

    handleGeoData = (value) => {
        this.props.onChange(this.props.columnKey, value);
    }

    handleFilterChange = (value) => {
        const { columnKey } = this.props;
        this.props.onFilterChange(columnKey, value);
    }

    render() {
        const {
            sortOrder,
            value,
            statusData,
            filterValue,
            disabled,
            filterComponent: Filter,
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
                {
                    shouldExtractGeo(value) &&
                    <TriggerAndPoll
                        compareValue={value}
                        url={`/tabular-fields/${value.id}/`}
                        triggerUrl={`/tabular-geo-extraction-trigger/${value.id}/`}
                        shouldTrigger={shouldExtractGeo}
                        shouldPoll={shouldPollGeo}
                        isValid={isValidGeo}
                        onDataReceived={this.handleGeoData}
                    >
                        <LoadingOnValid />
                    </TriggerAndPoll>
                }
                <Filter
                    className={styles.searchBox}
                    disabled={disabled}
                    value={filterValue}
                    onChange={this.handleFilterChange}
                />
                <HealthBar
                    data={statusData}
                    valueSelector={healthBarValueSelector}
                    labelSelector={undefined}
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

