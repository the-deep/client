import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    requiredCondition,
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    TextInput,
    Modal,
} from '@the-deep/deep-ui';

import { useLazyRequest } from '#utils/request';
import {
    Region,
} from '#typings';

import styles from './styles.scss';

type FormType = {
    title: string;
    project: number;
    code?: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;

const schema: FormSchema = {
    fields: () => ({
        title: [requiredStringCondition],
        code: [requiredStringCondition],
        project: [requiredCondition],
    }),
};

interface Props {
    projectId: number;
    onSuccess: () => void;
    onModalClose: () => void;
}

function CustomGeoAddForm(props: Props) {
    const {
        projectId,
        onSuccess,
        onModalClose,
    } = props;

    const defaultFormValue: PartialForm<FormType> = {
        project: projectId,
    };

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const {
        trigger: addRegionsTrigger,
        pending: addRegionsPending,
    } = useLazyRequest<unknown, Region>({
        url: 'server://regions/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onSuccess();
            onModalClose();
        },
    });

    const handleCustomGeoSubmitClick = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            addRegionsTrigger(val as Region);
        }
    }, [setError, validate, addRegionsTrigger]);

    return (
        <Modal
            heading="Add Custom Geo Area"
            onCloseButtonClick={onModalClose}
            footerActions={(
                <Button
                    name="submit"
                    type="submit"
                    onClick={handleCustomGeoSubmitClick}
                    disabled={pristine || addRegionsPending}
                >
                    Add
                </Button>
            )}
        >
            <div className={styles.row}>
                <TextInput
                    className={styles.input}
                    name="title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                    label="Title"
                />
                <TextInput
                    className={styles.input}
                    name="code"
                    value={value.code}
                    onChange={setFieldValue}
                    error={error?.code}
                    label="Code"
                />
            </div>
        </Modal>
    );
}

export default CustomGeoAddForm;
