import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { _cs, doesObjectHaveNoData } from '@togglecorp/fujs';
import Faram, { FaramInputElement } from '@togglecorp/faram';
import { Switch as SwitchRaw } from '@togglecorp/toggle-ui';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SearchInput from '#rsci/SearchInput';

import styles from './styles.scss';

const Switch = FaramInputElement(SwitchRaw);

const faramSchema = {
    fields: {
        search: [],
        blocked: [],
    },
};

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onFilterApply: PropTypes.func.isRequired,
    onFilterClear: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
    filters: {},
};
function ConnectorLeadsFilter(props) {
    const {
        className,
        filters: filtersFromProps,
        onFilterApply,
        onFilterClear,
    } = props;

    const [filters, setFilters] = useState(filtersFromProps);
    const [errors, setErrors] = useState({});

    const filterIsEmpty = doesObjectHaveNoData(filters, ['', false]);
    const filterFromPropsIsEmpty = doesObjectHaveNoData(filtersFromProps, ['', false]);

    const handleFaramChange = useCallback(
        (values, err) => {
            setFilters(values);
            setErrors(err);
            onFilterApply(values);
        },
        [onFilterApply],
    );

    const handleFaramFailure = useCallback(
        (err) => {
            setErrors(err);
        },
        [],
    );

    const handleFilterClear = useCallback(
        () => {
            setFilters({});
            if (!filterFromPropsIsEmpty) {
                onFilterClear();
            }
        },
        [filterFromPropsIsEmpty, onFilterClear],
    );

    return (
        <Faram
            className={_cs(styles.container, className)}
            value={filters}
            errors={errors}
            onValidationFailure={handleFaramFailure}
            onChange={handleFaramChange}
            schema={faramSchema}
        >
            <SearchInput
                faramElementName="search"
                // FIXME: Use string
                label="Search"
                showHintAndError={false}
            />
            <Switch
                name={undefined}
                faramElementName="blocked"
                // FIXME: Use string
                label="Blocked"
                showHintAndError={false}
            />
            <DangerButton
                disabled={filterIsEmpty && filterFromPropsIsEmpty}
                onClick={handleFilterClear}
            >
                {/* FIXME: Use string */}
                Clear
            </DangerButton>
        </Faram>
    );
}

ConnectorLeadsFilter.propTypes = propTypes;
ConnectorLeadsFilter.defaultProps = defaultProps;

export default ConnectorLeadsFilter;
