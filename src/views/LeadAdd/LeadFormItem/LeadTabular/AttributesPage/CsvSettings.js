import React from 'react';

import TextInput from '#rsci/TextInput';
import _ts from '#ts';

const CsvSettings = () => (
    <TextInput
        faramElementName="delimiter"
        label={_ts('addLeads.tabular', 'delimiterLabel')}
        placeholder={_ts('addLeads.tabular', 'delimiterPlaceholder')}
        showLabel
        showHintAndError
    />
);

export default CsvSettings;
