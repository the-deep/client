import React, { useCallback, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { useParams } from 'react-router-dom';
import {
    useForm,
    requiredCondition,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextInput,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#utils/request';
import { LeadGroup } from '#types';
import _ts from '#ts';

type FormType = Partial<Pick<LeadGroup, 'title' | 'project'>>
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const leadGroupSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        project: [requiredCondition],
    }),
};

export interface Props {
    onModalClose: () => void;
    onLeadGroupAdd?: (leadGroup: LeadGroup) => void;
}

function AddLeadGroupModal(props: Props) {
    const {
        onModalClose,
        onLeadGroupAdd,
    } = props;

    const { projectId } = useParams<{ projectId: string }>();
    const activeProject = +projectId;

    const {
        trigger: leadGroupAddTrigger,
        pending: leadGroupAddPending,
    } = useLazyRequest<LeadGroup, FormType>({
        url: 'server://lead-groups/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onLeadGroupAdd) {
                onLeadGroupAdd(response);
            }
            onModalClose();
        },
        failureHeader: _ts('addLeadGroup', 'title'),
    });

    const defaultFormValue: FormType = useMemo(() => ({
        project: activeProject,
    }), [activeProject]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(leadGroupSchema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                leadGroupAddTrigger(val);
            }
        },
        [setError, validate, leadGroupAddTrigger],
    );

    return (
        <Modal
            heading={_ts('addLeadGroup', 'addLeadGroupHeading')}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <Button
                    name="submit"
                    type="submit"
                    variant="primary"
                    disabled={pristine || leadGroupAddPending}
                    onClick={handleSubmit}
                >
                    {_ts('addOrganizationModal', 'save')}
                </Button>
            )}
        >
            {leadGroupAddPending && <PendingMessage />}
            <TextInput
                name="title"
                value={value?.title}
                error={error?.title}
                onChange={setFieldValue}
                label={_ts('addLeadGroup', 'titleLabel')}
                placeholder={_ts('addLeadGroup', 'titlePlaceholder')}
            />
        </Modal>
    );
}

export default AddLeadGroupModal;
