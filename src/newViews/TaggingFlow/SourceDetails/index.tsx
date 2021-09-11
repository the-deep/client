import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Card } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    SetBaseValueArg,
} from '@togglecorp/toggle-form';

import LeadEditForm from '#newViews/Tagging/Sources/LeadEditModal/LeadEditForm';
import { PartialFormType } from '#newViews/Tagging/Sources/LeadEditModal/LeadEditForm/schema';

import styles from './styles.scss';

interface Props {
    className?: string;
    pending: boolean;
    leadValue: PartialFormType;
    setLeadFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    ready: boolean;
    leadInitialValue: PartialFormType;
    leadFormError: Error<PartialFormType> | undefined;
    setValue: (value: SetBaseValueArg<PartialFormType>) => void;
    setPristine: (val: boolean) => void;
    projectId: number;
}

function SourceDetails(props: Props) {
    const {
        className,
        ready,
        leadValue,
        leadInitialValue,
        setLeadFieldValue,
        setValue,
        setPristine,
        leadFormError,
        pending,
        projectId,
    } = props;

    return (
        <div className={_cs(className, styles.sourceDetails)}>
            <Card className={styles.preview}>
                Preview
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    pending={pending}
                    value={leadValue}
                    initialValue={leadInitialValue}
                    setFieldValue={setLeadFieldValue}
                    error={leadFormError}
                    setValue={setValue}
                    setPristine={setPristine}
                    ready={ready}
                    projectId={projectId}
                />
            </Card>
        </div>
    );
}

export default SourceDetails;
