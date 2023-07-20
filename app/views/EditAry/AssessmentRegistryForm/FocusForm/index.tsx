import React from 'react';
import {
    EntriesAsList,
    Error,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';
import { Checkbox } from '@the-deep/deep-ui';

import { PartialFormType } from '../formSchema';
import styles from './styles.css';

interface Props {
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    error: Error<PartialFormType>;
}

function FocusForm(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error,
    } = props;

    return (
        <div className={styles.cardCollection}>
            <div className={styles.focusCard}>
                <Checkbox
                    className={styles.focusOptions}
                    label="Context"
                    name="confidentiality"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Displacement"
                    name="bgCrisisType"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Casualities"
                    name="affectedGroups"
                    value={undefined}
                    onChange={setFieldValue}
                />
            </div>
            <div className={styles.focusCard}>
                <Checkbox
                    className={styles.focusOptions}
                    label="Context"
                    name="confidentiality"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Displacement"
                    name="bgCrisisType"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Casualities"
                    name="affectedGroups"
                    value={undefined}
                    onChange={setFieldValue}
                />
            </div>
            <div className={styles.focusCard}>
                <Checkbox
                    className={styles.focusOptions}
                    label="Context"
                    name="confidentiality"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Displacement"
                    name="bgCrisisType"
                    value={undefined}
                    onChange={setFieldValue}
                />
                <Checkbox
                    className={styles.focusOptions}
                    label="Casualities"
                    name="affectedGroups"
                    value={undefined}
                    onChange={setFieldValue}
                />
            </div>
        </div>
    );
}

export default FocusForm;
