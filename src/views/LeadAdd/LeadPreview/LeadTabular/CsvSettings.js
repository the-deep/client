import React from 'react';
import PropTypes from 'prop-types';

import TextInput from '#rsci/TextInput';
import Checkbox from '#rsci/Checkbox';
import _ts from '#ts';

export default function CsvSettings({ className }) {
    return (
        <div className={className}>
            <TextInput
                faramElementName="delimiter"
                label={_ts('addLeads.tabular', 'delimiterLabel')}
            />
            <Checkbox
                faramElementName="noHeaders"
                label={_ts('addLeads.tabular', 'noHeaderLabel')}
            />
        </div>
    );
}
CsvSettings.propTypes = {
    className: PropTypes.string,
};
