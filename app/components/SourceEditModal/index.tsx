import React, { useCallback, useState } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    Modal,
} from '@the-deep/deep-ui';
import {
    useForm,
} from '@togglecorp/toggle-form';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import { transformErrorToToggleFormError } from '#utils/rest';
import LeadPreview from '#components/LeadPreview';

import { schema, PartialFormType, Lead } from '#components/LeadEditForm/schema';
import LeadEditForm from '#components/LeadEditForm';
import styles from './styles.css';

// TODO: Show attachment's title and link if lead is attachment type

interface Props {
    className?: string;
    onClose: () => void;
    sourceId?: number;
    projectId: number;
    onSourceSaveSuccess: () => void;
}

function SourceEditModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
        sourceId,
        onSourceSaveSuccess,
    } = props;

    const [ready, setReady] = useState(!sourceId);

    const [initialValue, setInitialValue] = useState<PartialFormType>(() => ({
        project: projectId,
        sourceType: 'website',
        priority: 100,
        confidentiality: 'unprotected',
        isAssessmentLead: false,
    }));

    const {
        pristine,
        setPristine,
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
        skip: !sourceId,
        url: `server://v2/leads/${sourceId}/`,
        onSuccess: (response) => {
            setInitialValue(response);
            setValue(response);
            setReady(true);
        },
        failureHeader: 'Leads',
    });

    const {
        pending: leadSavePending,
        trigger: triggerLeadSave,
    } = useLazyRequest<Lead, PartialFormType>({
        url: sourceId ? `server://v2/leads/${sourceId}/` : 'server://v2/leads/',
        method: sourceId ? 'PATCH' : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            onSourceSaveSuccess();
        },
        onFailure: (response, ctx) => {
            if (response.value.errors) {
                setError(transformErrorToToggleFormError(schema, ctx, response.value.errors));
            }
        },
        failureHeader: 'Lead',
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
            heading={sourceId ? 'Edit source' : 'Add a source'}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="save"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            <Card className={styles.previewContainer}>
                <LeadPreview
                    className={styles.preview}
                    url={value?.url}
                    attachment={value?.attachment}
                />
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    pending={pending}
                    value={value}
                    projectId={projectId}
                    initialValue={initialValue}
                    setFieldValue={setFieldValue}
                    setValue={setValue}
                    setPristine={setPristine}
                    error={riskyError}
                    ready={ready}
                />
            </Card>
        </Modal>
    );
}

export default SourceEditModal;
