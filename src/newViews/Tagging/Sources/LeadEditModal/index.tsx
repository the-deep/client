import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    Modal,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    useForm,
} from '@togglecorp/toggle-form';

import { useRequest, useLazyRequest } from '#utils/request';
import { transformErrorToToggleFormError } from '#rest';

import LeadEditForm from './LeadEditForm';
import { schema, PartialFormType, Lead } from './LeadEditForm/schema';
import styles from './styles.scss';

// TODO: Show attachment's title and link if lead is attachment type

interface Props {
    className?: string;
    onClose: () => void;
    leadId?: number;
    projectId: number;
    onLeadSaveSuccess: () => void;
}

function LeadEditModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
        leadId,
        onLeadSaveSuccess,
    } = props;

    const [initialValue, setInitialValue] = useState<PartialFormType>(() => ({
        project: projectId,
        sourceType: 'website',
        priority: 100,
        confidentiality: 'unprotected',
    }));

    const {
        pristine,
        value,
        setFieldValue,
        setValue,
        error: riskyError,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const {
        pending: leadGetPending,
    } = useRequest<Lead>({
        skip: !leadId,
        url: `server://v2/leads/${leadId}/`,
        onSuccess: (response) => {
            setInitialValue(response);
            setValue(response);
        },
        failureHeader: 'Leads',
    });

    const {
        pending: leadSavePending,
        trigger: triggerLeadSave,
    } = useLazyRequest<Lead, PartialFormType>({
        url: leadId ? `server://v2/leads/${leadId}/` : 'server://v2/leads/',
        method: leadId ? 'PATCH' : 'POST',
        body: ctx => ({
            ...ctx,
            authors: ctx.authors ?? [],
            emmTriggers: ctx.emmTriggers ?? [],
            emmEntities: ctx.emmEntities ?? [],
        }),
        onSuccess: () => {
            onLeadSaveSuccess();
        },
        onFailure: (response, ctx) => {
            if (response.value.errors) {
                setError(transformErrorToToggleFormError(schema, ctx, response.value.errors));
            }
        },
        failureHeader: 'Leads',
    });

    const pending = leadGetPending || leadSavePending;

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            triggerLeadSave(val);
        }
    }, [triggerLeadSave, setError, validate]);

    return (
        <Modal
            className={_cs(className, styles.leadEditModal)}
            onCloseButtonClick={onClose}
            heading={leadId ? 'Edit source' : 'Add a source'}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="save"
                    disabled={pristine}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {pending && <PendingMessage />}
            <Card className={styles.preview}>
                Preview
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    value={value}
                    initialValue={initialValue}
                    setFieldValue={setFieldValue}
                    error={riskyError}
                />
            </Card>
        </Modal>
    );
}

export default LeadEditModal;
