import React, { useCallback, useMemo } from 'react';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Button,
    TextInput,
    Modal,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import { RegionsForGeoAreasQuery } from '#generated/types';

import styles from './styles.css';

type Region = NonNullable<NonNullable<NonNullable<RegionsForGeoAreasQuery['project']>['regions']>[number]>;

type FormType = {
    title: string;
    project: string;
    code?: string;
    public?: boolean;
    isPublished?: boolean;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;

const schema: FormSchema = {
    fields: () => ({
        title: [requiredStringCondition],
        code: [requiredStringCondition],
        project: [requiredCondition],
        public: [],
        isPublished: [],
    }),
};

interface Props {
    projectId: string;
    onSuccess: (value: Region) => void;
    onModalClose: () => void;
}

function CustomGeoAddModal(props: Props) {
    const {
        projectId,
        onSuccess,
        onModalClose,
    } = props;

    const defaultFormValue = useMemo(
        (): PartialForm<FormType> => ({
            project: projectId,
            public: false,
            isPublished: false,
        }),
        [projectId],
    );

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
    } = useLazyRequest<Region, Region>({
        url: 'server://regions/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onSuccess(response);
            onModalClose();
        },
        // TODO: add error handling
    });

    const handleCustomGeoSubmitClick = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => addRegionsTrigger(val as Region),
            );
            submit();
        },
        [setError, validate, addRegionsTrigger],
    );

    return (
        <Modal
            heading="Add Custom Geo Area"
            onCloseButtonClick={onModalClose}
            size="small"
            freeHeight
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
            <NonFieldError error={error} />
            <div className={styles.row}>
                <TextInput
                    name="title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                    label="Title"
                    disabled={addRegionsPending}
                />
                <TextInput
                    name="code"
                    value={value.code}
                    onChange={setFieldValue}
                    error={error?.code}
                    label="ISO3 Code"
                    disabled={addRegionsPending}
                />
            </div>
        </Modal>
    );
}

export default CustomGeoAddModal;
