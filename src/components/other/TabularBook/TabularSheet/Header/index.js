import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';

import TriggerAndPoll from '#components/general/TriggerAndPoll';
import { iconNames } from '#constants';

import HealthBar from '#rscz/HealthBar';

import EditField from './EditField';
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
    type === 'geo' &&
    (!geodata || geodata.status !== 'success')
);
const shouldPollGeo = ({ type, geodata }) => (
    type === 'geo' &&
    (!geodata || geodata.status === 'pending')
);
const isValidGeo = ({ type, geodata }) => (
    type === 'geo' &&
    (geodata && geodata.status === 'success')
);

const healthColorScheme = [
    '#41cf76',
    '#f44336',
];

const identity = x => x;
const healthBarValueSelector = identity;
const healthBarKeySelector = identity;

export default class Header extends React.PureComponent {
    static propTypes = {
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.shape({}).isRequired,
        onSortClick: PropTypes.func.isRequired,
        sortOrder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        statusData: PropTypes.arrayOf(PropTypes.number).isRequired,
        // First value is valid count and the second is invalid count
    };

    static defaultProps = {
        sortOrder: undefined,
    };

    handleSortClick = () => {
        this.props.onSortClick(this.props.columnKey);
    }

    handleChange = (value) => {
        this.props.onChange(this.props.columnKey, value);
    }

    handleGeoData = (value) => {
        this.props.onChange(this.props.columnKey, value);
    }

    renderGeoPending = () => {
        const { value } = this.props;

        if (!shouldExtractGeo(value)) {
            return null;
        }

        const { id } = value;

        return (
            <TriggerAndPoll
                compareValue={value}
                url={`/tabular-fields/${id}/`}
                triggerUrl={`/tabular-geo-extraction-trigger/${id}/`}
                shouldTrigger={shouldExtractGeo}
                shouldPoll={shouldPollGeo}
                isValid={isValidGeo}
                onDataReceived={this.handleGeoData}
            >
                <LoadingOnValid />
            </TriggerAndPoll>
        );
    }

    render() {
        const {
            sortOrder,
            value,
            statusData,
        } = this.props;

        return (
            <div className={styles.header}>
                <Button
                    className={styles.title}
                    onClick={this.handleSortClick}
                    iconName={getSortIcon(sortOrder)}
                    transparent
                >
                    {value.title}
                </Button>
                {this.renderGeoPending()}
                <EditField
                    className={styles.edit}
                    onChange={this.handleChange}
                    iconName={iconNames.edit}
                    value={value}
                    transparent
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

