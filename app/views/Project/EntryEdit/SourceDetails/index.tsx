import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import LeadPreview from '#components/lead/LeadPreview';
import LeadEditForm from '#components/lead/LeadEditForm';
import { PartialFormType } from '#components/lead/LeadEditForm/schema';

import styles from './styles.css';

interface Props {
    className?: string;
    pending: boolean;
    leadValue: PartialFormType;
    setLeadFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    leadFormError: Error<PartialFormType> | undefined;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    setPristine: (val: boolean) => void;
    projectId: string;
    disabled?: boolean;
}

function SourceDetails(props: Props) {
    const {
        className,
        leadValue,
        setLeadFieldValue,
        setValue,
        setPristine,
        leadFormError,
        pending,
        projectId,
        disabled,
    } = props;

    return (
        <div className={_cs(className, styles.sourceDetails)}>
            <Card className={styles.previewContainer}>
                <LeadPreview
                    className={styles.preview}
                    url={leadValue.url}
                    attachment={leadValue.attachment}
                />
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    pending={pending}
                    value={leadValue}
                    setFieldValue={setLeadFieldValue}
                    error={leadFormError}
                    setValue={setValue}
                    setPristine={setPristine}
                    projectId={projectId}
                    disabled={disabled}
                />
            </Card>
        </div>
    );
}

export default SourceDetails;
