import React, { useCallback } from 'react';
import { IoChevronForward } from 'react-icons/io5';
import {
    useForm,
    ObjectSchema,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    ButtonLikeLink,
    Button,
    Modal,
    TextInput,
    TextArea,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import styles from './styles.scss';

type FormType = {
    description?: string;
    justification?: string;
}
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        description: [],
        justification: [],
    }),
};

const defaultFormValue: FormType = {
    description: '',
    justification: '',
};

interface Props {
    className?: string;
}

function RequestPrivateProjectButton(props: Props) {
    const {
        className,
    } = props;

    const [
        isModalVisible,
        showModal,
        hideModal,
    ] = useModalState(false);

    const {
        value,
        error: riskyError,
        setValue,
        setFieldValue,
    } = useForm(formSchema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleClose = useCallback(() => {
        setValue({});
        hideModal();
    }, [setValue, hideModal]);

    return (
        <>
            <Button
                className={className}
                variant="secondary"
                onClick={showModal}
                actions={<IoChevronForward />}
                name={_ts('requestPrivateProject', 'title')}
            >
                {_ts('requestPrivateProject', 'title')}
            </Button>
            {isModalVisible && (
                <Modal
                    className={styles.requestPrivateProjectModal}
                    heading={_ts('requestPrivateProject', 'title')}
                    bodyClassName={styles.modalBody}
                    onCloseButtonClick={hideModal}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                variant="secondary"
                                onClick={handleClose}
                            >
                                {_ts('requestPrivateProject', 'cancel')}
                            </Button>
                            <ButtonLikeLink
                                variant="primary"
                                onClick={handleClose}
                                to={`mailto:pm@thedeep.io?subject=${value.description}&body=${value.justification}`}
                            >
                                {_ts('requestPrivateProject', 'send')}
                            </ButtonLikeLink>
                        </>
                    )}
                >
                    <TextInput
                        className={styles.input}
                        name="description"
                        onChange={setFieldValue}
                        value={value.description}
                        error={error?.description}
                        label={_ts('requestPrivateProject', 'description')}
                        placeholder={_ts('requestPrivateProject', 'descriptionPlaceholder')}
                        autoFocus
                    />
                    <TextArea
                        className={styles.input}
                        name="justification"
                        rows={4}
                        value={value.justification}
                        error={error?.justification}
                        onChange={setFieldValue}
                        label={_ts('requestPrivateProject', 'justification')}
                        placeholder={_ts('requestPrivateProject', 'justificationPlaceholder')}
                    />
                    <div className={styles.message}>
                        {_ts('requestPrivateProject', 'message')}
                    </div>
                </Modal>
            )}
        </>
    );
}

export default RequestPrivateProjectButton;
