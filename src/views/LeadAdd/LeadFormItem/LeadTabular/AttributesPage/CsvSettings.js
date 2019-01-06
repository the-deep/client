import React from 'react';

import TextInput from '#rsci/TextInput';
import _ts from '#ts';

export default () => (
    <TextInput
        faramElementName="delimiter"
        label={_ts('addLeads.tabular', 'delimiterLabel')}
        showLabel
        showHintAndError
    />
);
