import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    randomString,
    listToMap,
} from '@togglecorp/fujs';
import {
    useForm,
    useFormArray,
    getErrorObject,
    createSubmitHandler,
    removeNull,
    internal,
} from '@togglecorp/toggle-form';
import { useMutation, gql } from '@apollo/client';
import {
    PendingMessage,
    useAlert,
    Button,
    Container,
    ListView,
    Modal,
    TextInput,
} from '@the-deep/deep-ui';

import {
    ProjectConnectorCreateMutation,
    ProjectConnectorCreateMutationVariables,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    schema,
    getDefaultValues,
    PartialSourceType,
} from '../schema';

import { ConnectorInputType } from '../types';

import CheckButton from './CheckButton';
import ConnectorSourceForm from './ConnectorSourceForm';

import styles from './styles.css';

type SupportedSource = 'RELIEF_WEB' | 'UNHCR';
const supportedSources = ['RELIEF_WEB', 'UNHCR'];

const sourcesLabel = {
    RELIEF_WEB: 'Relief Web',
    UNHCR: 'UNHCR',
};

const sourceKeySelector = (item: SupportedSource) => item;
const valueSourceKeySelector = (item: { clientId: string }) => item.clientId;

const CREATE_CONNECTOR = gql`
    mutation ProjectConnectorCreate(
        $input: UnifiedConnectorInputType!,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            unifiedConnector {
                unifiedConnectorCreate(data: $input) {
                    errors
                    result {
                        id
                    }
                    ok
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    connectorId: string | undefined;
    projectId: string;
    onClose: () => void;
}

function EditConnectorModal(props: Props) {
    const {
        className,
        connectorId,
        projectId,
        onClose,
    } = props;

    const defaultValue = useMemo(() => getDefaultValues(), []);

    const {
        value,
        pristine,
        error: riskyError,
        setError,
        validate,
        setFieldValue,
    } = useForm(schema, defaultValue);

    const alert = useAlert();

    const [
        createConnector,
        { loading: connectorCreatePending },
    ] = useMutation<ProjectConnectorCreateMutation, ProjectConnectorCreateMutationVariables>(
        CREATE_CONNECTOR,
        {
            onCompleted: (response) => {
                const res = response?.project?.unifiedConnector?.unifiedConnectorCreate;
                if (!res) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = res;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    alert.show(
                        'Successfully created a new connector.',
                        { variant: 'success' },
                    );
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const {
        setValue: onRowChange,
    } = useFormArray('sources', setFieldValue);

    const error = getErrorObject(riskyError);

    const handleSourceClick = useCallback((key: SupportedSource) => {
        setFieldValue(
            (oldSources: PartialSourceType[] | undefined = []) => {
                const selectedSourceIndex = oldSources
                    ?.findIndex((source) => source.source === key);

                if (selectedSourceIndex === -1) {
                    return [
                        ...(oldSources ?? []),
                        {
                            clientId: randomString(),
                            title: sourcesLabel[key],
                            params: {},
                            source: key,
                        },
                    ];
                }
                return oldSources?.filter((source) => source.source !== key);
            },
            'sources' as const,
        );
    }, [setFieldValue]);

    const usedSourceMap = listToMap(
        value?.sources?.filter((source) => isDefined(source.source)),
        (source) => (source.source),
        () => true,
    );

    const buttonRendererParams = useCallback((key: SupportedSource) => ({
        name: key,
        value: !!usedSourceMap?.[key],
        onClick: handleSourceClick,
        children: sourcesLabel[key] ?? key,
    }), [
        usedSourceMap,
        handleSourceClick,
    ]);

    const sourcesError = getErrorObject(error?.sources);

    const connectorSourceRendererParams = useCallback((
        key: string,
        data: PartialSourceType,
        index,
    ) => ({
        name: index,
        error: sourcesError?.[key],
        value: data,
        onChange: onRowChange,
    }), [onRowChange, sourcesError]);

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (finalValue) => {
                createConnector({
                    variables: {
                        projectId,
                        input: finalValue as ConnectorInputType,
                    },
                });
            },
        );
        submit();
    }, [
        projectId,
        setError,
        validate,
        createConnector,
    ]);

    return (
        <Modal
            className={_cs(styles.editConnectorModal, className)}
            onCloseButtonClick={onClose}
            size="cover"
            heading={connectorId ?? 'Add New Connector'}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmit}
                    disabled={pristine}
                >
                    Save
                </Button>
            )}
            bodyClassName={styles.body}
        >
            {connectorCreatePending && <PendingMessage />}
            <div className={styles.leftContainer}>
                <TextInput
                    name="title"
                    label="Title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <Container
                    heading="Select Information Portals"
                    headingDescription="Select from which portals you want to gather information"
                    headingSize="extraSmall"
                >
                    <ListView
                        className={styles.buttons}
                        data={supportedSources}
                        renderer={CheckButton}
                        keySelector={sourceKeySelector}
                        rendererParams={buttonRendererParams}
                        filtered={false}
                        pending={false}
                        errored={false}
                    />
                </Container>
            </div>
            <ListView
                data={value?.sources}
                className={styles.rightContainer}
                keySelector={valueSourceKeySelector}
                renderer={ConnectorSourceForm}
                rendererParams={connectorSourceRendererParams}
                emptyMessage="Please select sources"
                filtered={false}
                pending={false}
                errored={false}
            />
        </Modal>
    );
}

export default EditConnectorModal;
