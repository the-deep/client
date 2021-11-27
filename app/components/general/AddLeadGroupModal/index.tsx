import React, { useCallback, useMemo } from 'react';
import {
    useForm,
    requiredCondition,
    ObjectSchema,
    requiredStringCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    TextInput,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import ProjectContext from '#base/context/ProjectContext';
import {
    useLazyRequest,
    useRequest,
} from '#base/utils/restRequest';
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
    leadGroupToEdit?: string;
    // FIXME: Replace with graphql mutation
    onLeadGroupAdd?: (leadGroup: { id: string; title: string }) => void;
}

function AddLeadGroupModal(props: Props) {
    const {
        onModalClose,
        leadGroupToEdit,
        onLeadGroupAdd,
    } = props;

    const { project } = React.useContext(ProjectContext);
    const activeProject = project ? +project.id : undefined;

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
        setValue,
    } = useForm(leadGroupSchema, defaultFormValue);

    const {
        pending: leadGroupFetchPending,
    } = useRequest<LeadGroup>({
        skip: !leadGroupToEdit,
        url: `server://lead-groups/${leadGroupToEdit}/`,
        method: 'GET',
        onSuccess: (response) => {
            setValue({
                ...value,
                title: response?.title,
            });
        },
        failureHeader: _ts('addLeadGroup', 'title'),
    });

    const {
        trigger: leadGroupAddTrigger,
        pending: leadGroupAddPending,
    } = useLazyRequest<LeadGroup, FormType>({
        url: leadGroupToEdit ? `server://lead-groups/${leadGroupToEdit}/` : 'server://lead-groups/',
        method: leadGroupToEdit ? 'PATCH' : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            if (onLeadGroupAdd) {
                onLeadGroupAdd({
                    id: String(response.id),
                    title: response.title,
                });
            }
            onModalClose();
        },
        failureHeader: _ts('addLeadGroup', 'title'),
    });

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                leadGroupAddTrigger,
            );
            submit();
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
            {(leadGroupFetchPending || leadGroupAddPending) && <PendingMessage />}
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
