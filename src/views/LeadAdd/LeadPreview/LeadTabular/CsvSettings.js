import React from 'react';

import TextInput from '#rsci/TextInput';
import Checkbox from '#rsci/Checkbox';
import _ts from '#ts';

export default ({ className }) => (
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
