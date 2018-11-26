import React from 'react';

import { requiredCondition } from '#rscg/Faram';
import TextInput from '#rsci/TextInput';
import _ts from '#ts';

export const csvSchema = {
    fields: {
        delimiter: [requiredCondition],
    },
};

export default () => (
    <TextInput
        faramElementName="delimiter"
        label={_ts('addLeads.tabular', 'delimiterLabel')}
        placeholder={_ts('addLeads.tabular', 'delimiterPlaceholder')}
        showLabel
        showHintAndError
    />
);
