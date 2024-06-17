import React, { useCallback, useMemo } from 'react';
import { gql, useMutation } from '@apollo/client';
import { isDefined } from '@togglecorp/fujs';
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
    useAlert,
} from '@the-deep/deep-ui';
import NonFieldError from '#components/NonFieldError';
import {
    RegionInputType,
    CreateRegionMutation,
    CreateRegionMutationVariables,
} from '#generated/types';

import styles from './styles.css';

type NewRegionId = NonNullable<NonNullable<CreateRegionMutation['createRegion']>['result']>;

const CREATE_REGION = gql`
mutation CreateRegion($data: RegionInputType!) {
        createRegion(
            data: $data
        ) {
            ok
            errors
            result {
                id
                isPublished
            }

        }
    }
`;

type FormType = {
    title: string;
    project: string;
    code: string;
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
    projectId: string;
    onSuccess: (value: NewRegionId) => void;
    onModalClose: () => void;
}

function CustomGeoAddModal(props: Props) {
    const {
        projectId,
        onSuccess,
        onModalClose,
    } = props;

    const alert = useAlert();
    const defaultFormValue = useMemo(
        (): PartialForm<FormType> => ({
            project: projectId,
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

    // const {
    //     trigger: addRegionsTrigger,
    //     pending: addRegionsPending,
    // } = useLazyRequest<Region, Region>({
    //     url: 'server://regions/',
    //     method: 'POST',
    //     body: (ctx) => ctx,
    //     onSuccess: (response) => {
    //         onSuccess(response);
    //         onModalClose();
    //     },
    //     // TODO: add error handling
    // });

    const [
        createRegion,
        {
            loading: createRegionPending,
        },
    ] = useMutation<CreateRegionMutation, CreateRegionMutationVariables>(
        CREATE_REGION,
        {
            onCompleted: (response) => {
                if (!response || !response.createRegion || !response.createRegion.result) {
                    return;
                }

                const {
                    ok,
                    errors,
                    result,
                } = response.createRegion;

                if (errors) {
                    alert.show(
                        'Failed to create custom geo area.',
                        { variant: 'error' },
                    );
                }

                if (ok) {
                    alert.show(
                        'Custom geo area is successfully created!',
                        { variant: 'success' },
                    );
                    onSuccess(result);
                    onModalClose();
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create custom geo area.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleCustomGeoSubmitClick = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    if (isDefined(val.title) && isDefined(val.code) && isDefined(val.project)) {
                        createRegion({
                            variables: {
                                project: val.project,
                                code: val.code,
                                title: val.title,
                            },
                        });
                    }
                },
            );
            submit();
        },
        [setError, validate, createRegion],
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
                    disabled={pristine || createRegionPending}
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
                    disabled={createRegionPending}
                />
                <TextInput
                    name="code"
                    value={value.code}
                    onChange={setFieldValue}
                    error={error?.code}
                    label="ISO3 Code"
                    disabled={createRegionPending}
                />
            </div>
        </Modal>
    );
}

export default CustomGeoAddModal;
