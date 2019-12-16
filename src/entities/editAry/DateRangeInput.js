import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import NonFieldErrors from '#rsci/NonFieldErrors';
import DateInput from '#rsci/DateInput';

const DateRangeInput = ({ label, faramElementName, ...props }) => (
    <FaramGroup faramElementName={faramElementName}>
        <DateInput
            label={`${label} Start Date`}
            faramElementName="from"
            {...props}
        />
        <DateInput
            label={`${label} End Date`}
            faramElementName="to"
            {...props}
        />
        <NonFieldErrors faramElement />
    </FaramGroup>
);

DateRangeInput.propTypes = {
    label: PropTypes.string,
    faramElementName: PropTypes.string,
};

DateRangeInput.defaultProps = {
    label: '',
    faramElementName: undefined,
};

export default DateRangeInput;
