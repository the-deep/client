import React from 'react';
import { _cs } from '@togglecorp/fujs';

import WidgetForm from '#components/general/WidgetForm';
import {
    FrameworkFields,
    WidgetElement as WidgetFields,
} from '#typings/framework';
import { EntryFields } from '#typings/entry';

import styles from './styles.scss';

interface EditEntryFormProps {
    className?: string;
    framework: FrameworkFields;
    mode: string;
    entry: EntryFields;
}

function EditEntryForm(props: EditEntryFormProps) {
    const {
        className,
        framework,
        mode,
        entry,
    } = props;

    return (
        <WidgetForm
            entry={entry}
            framework={framework}
            mode={mode}
        />
    );
}

export default EditEntryForm;
