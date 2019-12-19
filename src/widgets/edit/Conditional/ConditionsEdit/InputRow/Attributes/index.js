import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { FaramGroup } from '@togglecorp/faram';

import GeoInput from '#components/input/GeoInput';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Checkbox from '#rsci/Checkbox';
import NumberInput from '#rsci/NumberInput';
import DateInput from '#rsci/DateInput';
import TimeInput from '#rsci/TimeInput';

import {
    afViewGeoOptionsSelector,
} from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    attribute: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgetData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widgetData: undefined,
    geoOptions: {},
};

const mapStateToProps = state => ({
    geoOptions: afViewGeoOptionsSelector(state),
});

@connect(mapStateToProps)
export default class ConditionAttribute extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getOptions = memoize((attribute, widgetData) => (
        Array.isArray(attribute.options)
            ? [...attribute.options]
            : attribute.options(widgetData)
    ))

    getRegions = memoize(geoOptions => (
        Object.keys(geoOptions).reduce((acc, r) => {
            if (geoOptions[r] && geoOptions[r][0]) {
                return (
                    [
                        {
                            id: geoOptions[r][0].region,
                            title: geoOptions[r][0].regionTitle,
                        },
                        ...acc,
                    ]
                );
            }
            return acc;
        }, [])
    ))

    render() {
        const {
            attribute,
            widgetData,
            geoOptions,
        } = this.props;

        const regions = this.getRegions(geoOptions);

        if (attribute.type === 'select') {
            const options = this.getOptions(attribute, widgetData);
            return (
                <SelectInput
                    className={styles.input}
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    options={options}
                    keySelector={attribute.keySelector}
                    labelSelector={attribute.labelSelector}
                    showHintAndError={false}
                />
            );
        } else if (attribute.type === 'multiselect') {
            const options = this.getOptions(attribute, widgetData);
            return (
                <FaramGroup
                    key={attribute.key}
                    faramElementName={attribute.key}
                >
                    <div className={styles.multiSelectContainer}>
                        <MultiSelectInput
                            className={styles.multiInput}
                            faramElementName="values"
                            label={attribute.title}
                            options={options}
                            keySelector={attribute.keySelector}
                            labelSelector={attribute.labelSelector}
                            showHintAndError={false}
                        />
                        <Checkbox
                            className={styles.input}
                            faramElementName="testEvery"
                            label={_ts('widgets.editor.conditional', 'testEveryTitle')}
                        />
                    </div>
                </FaramGroup>
            );
        } else if (attribute.type === 'number') {
            return (
                <NumberInput
                    className={styles.input}
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    showHintAndError={false}
                />
            );
        } else if (attribute.type === 'date') {
            return (
                <DateInput
                    className={styles.input}
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    showHintAndError={false}
                />
            );
        } else if (attribute.type === 'time') {
            return (
                <TimeInput
                    className={styles.input}
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    showHintAndError={false}
                />
            );
        } else if (attribute.type === 'geo') {
            return (
                <GeoInput
                    className={styles.input}
                    key={attribute.key}
                    faramElementName={attribute.key}
                    label={attribute.title}
                    geoOptionsByRegion={geoOptions}
                    showHintAndError={false}
                    regions={regions}
                    hideList
                />
            );
        }

        return null;
    }
}
