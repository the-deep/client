import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';

import TriggerAndPoll from '#components/general/TriggerAndPoll';
import { iconNames } from '#constants';

import HealthBar from '#rscz/HealthBar';

import _cs from '#cs';
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

const healthBarValueSelector = x => x;
const healthBarKeySelector = (x, i) => `${x}-${i}`;

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

    handleGeoData = (value) => {
        this.props.onChange(this.props.columnKey, value);
    }

    render() {
        const {
            sortOrder,
            value,
            statusData,
        } = this.props;

        const iconNameMapping = {
            string: iconNames.text,
            number: iconNames.calculator,
            geo: iconNames.globe,
            datetime: iconNames.calendar,
        };
        const icon = iconNameMapping[value.type];

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
                {/* TODO: render search components according to data type */}
                <TextInput
                    className={styles.searchBox}
                    placeholder="Search"
                    showLabel={false}
                    showHintAndError={false}
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

