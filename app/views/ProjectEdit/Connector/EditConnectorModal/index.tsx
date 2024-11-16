import React, { useCallback, useState, useMemo } from 'react';
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
import { useQuery, useMutation, gql } from '@apollo/client';
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
    ProjectConnectorUpdateMutation,
    ProjectConnectorUpdateMutationVariables,

    ProjectConnectorDetailsToEditQuery,
    ProjectConnectorDetailsToEditQueryVariables,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NonFieldError from '#components/NonFieldError';

import {
    schema,
    getDefaultValues,
    PartialSourceType,
} from '../schema';

import { ConnectorInputType } from '../types';

import CheckButton from './CheckButton';
import ConnectorSourceForm from './ConnectorSourceForm';

import styles from './styles.css';

type SupportedSource = 'RELIEF_WEB' | 'UNHCR' | 'RSS_FEED' | 'ATOM_FEED' | 'HUMANITARIAN_RESP' | 'PDNA' | 'KOBO';
const supportedSources = ['RELIEF_WEB', 'UNHCR', 'RSS_FEED', 'ATOM_FEED', 'HUMANITARIAN_RESP', 'PDNA', 'KOBO'];

const sourcesLabel: { [key in SupportedSource]: string } = {
    RELIEF_WEB: 'Relief Web',
    UNHCR: 'UNHCR',
    RSS_FEED: 'RSS Feed',
    ATOM_FEED: 'ATOM Feed',
    HUMANITARIAN_RESP: 'Humanitarian Response',
    PDNA: 'PDNA',
    KOBO: 'KoboToolbox',
};

const sourceKeySelector = (item: SupportedSource) => item;
const valueSourceKeySelector = (item: { clientId: string }) => item.clientId;

const CREATE_CONNECTOR = gql`
    mutation ProjectConnectorCreate(
        $input: UnifiedConnectorWithSourceInputType!,
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

const UPDATE_CONNECTOR = gql`
    mutation ProjectConnectorUpdate(
        $input: UnifiedConnectorWithSourceInputType!,
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            unifiedConnector {
                unifiedConnectorWithSourceUpdate(id: $connectorId, data: $input) {
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

const PROJECT_CONNECTOR_TO_EDIT = gql`
    query ProjectConnectorDetailsToEdit(
        $projectId: ID!,
        $connectorId: ID!,
    ) {
        project(id: $projectId) {
            id
            unifiedConnector {
                unifiedConnector(id: $connectorId) {
                    id
                    clientId
                    title
                    isActive
                    sources {
                        id
                        clientId
                        params
                        source
                        createdAt
                        title
                        lastFetchedAt
                    }
                }
            }
        }
    }
`;

interface Props {
    className?: string;
    connectorId: string | undefined;
    projectId: string;
    onCloseClick: () => void;
    onCreateSuccess?: (connectorId: string) => void;
    onUpdateSuccess?: () => void;
}

function EditConnectorModal(props: Props) {
    const {
        className,
        connectorId,
        projectId,
        onCloseClick,
        onCreateSuccess,
        onUpdateSuccess,
    } = props;

    const defaultValue = useMemo(() => getDefaultValues(), []);

    const {
        value,
        pristine,
        error: riskyError,
        setError,
        validate,
        setValue,
        setFieldValue,
    } = useForm(schema, defaultValue);

    const variables = useMemo(
        () => (connectorId ? ({
            projectId,
            connectorId,
        }) : undefined),
        [
            projectId,
            connectorId,
        ],
    );

    const {
        loading: pendingConnectorDetails,
    } = useQuery<ProjectConnectorDetailsToEditQuery, ProjectConnectorDetailsToEditQueryVariables>(
        PROJECT_CONNECTOR_TO_EDIT,
        {
            skip: !connectorId,
            variables,
            onCompleted: (response) => {
                const connector = response?.project?.unifiedConnector?.unifiedConnector;
                if (connector) {
                    setValue(removeNull(connector));
                }
            },
        },
    );

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
                    result,
                } = res;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    alert.show(
                        'Successfully created a new connector.',
                        { variant: 'success' },
                    );
                    if (onCreateSuccess && result?.id) {
                        onCreateSuccess(result.id);
                    }
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const [
        updateConnector,
        { loading: connectorUpdatePending },
    ] = useMutation<ProjectConnectorUpdateMutation, ProjectConnectorUpdateMutationVariables>(
        UPDATE_CONNECTOR,
        {
            onCompleted: (response) => {
                const res = response?.project?.unifiedConnector?.unifiedConnectorWithSourceUpdate;
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
                        'Successfully update the connector.',
                        { variant: 'success' },
                    );
                    if (onUpdateSuccess) {
                        onUpdateSuccess();
                    }
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
                    .findIndex((source) => source.source === key);

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

    const usedSourceMap = useMemo(
        () => (
            listToMap(
                value?.sources?.filter((source) => isDefined(source.source)),
                (source) => (source.source),
                () => true,
            )
        ),
        [value],
    );

    const buttonRendererParams = useCallback((key: SupportedSource) => ({
        name: key,
        value: !!usedSourceMap?.[key],
        onClick: handleSourceClick,
        children: sourcesLabel[key] ?? key,
        disabled: connectorCreatePending,
    }), [
        connectorCreatePending,
        usedSourceMap,
        handleSourceClick,
    ]);

    const sourcesError = getErrorObject(error?.sources);

    const [rssErrored, setRssErrored] = useState(false);
    const [atomErrored, setAtomErrored] = useState(false);

    const connectorSourceRendererParams = useCallback((
        key: string,
        data: PartialSourceType,
        index: number,
    ) => ({
        name: index,
        error: sourcesError?.[key],
        value: data,
        onChange: onRowChange,
        disabled: connectorCreatePending,
        rssErrored,
        onRssErrorChange: setRssErrored,
        atomErrored,
        onAtomErrorChange: setAtomErrored,
    }), [
        atomErrored,
        rssErrored,
        onRowChange,
        sourcesError,
        connectorCreatePending,
    ]);

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (finalValue) => {
                if (connectorId) {
                    updateConnector({
                        variables: {
                            projectId,
                            connectorId,
                            input: finalValue as ConnectorInputType,
                        },
                    });
                } else {
                    createConnector({
                        variables: {
                            projectId,
                            input: {
                                ...finalValue,
                                isActive: true,
                            } as ConnectorInputType,
                        },
                    });
                }
            },
        );
        submit();
    }, [
        projectId,
        setError,
        validate,
        createConnector,
        updateConnector,
        connectorId,
    ]);

    const loading = pendingConnectorDetails || connectorCreatePending || connectorUpdatePending;

    return (
        <Modal
            className={_cs(styles.editConnectorModal, className)}
            onCloseButtonClick={onCloseClick}
            size="large"
            heading={connectorId ? 'Edit Connector' : 'Add New Connector'}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmit}
                    disabled={pristine || loading || rssErrored}
                >
                    Save
                </Button>
            )}
            bodyClassName={styles.body}
        >
            {loading && <PendingMessage />}
            <div className={styles.leftContainer}>
                <NonFieldError error={error} />
                <TextInput
                    name="title"
                    label="Title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <Container
                    className={styles.sourcesContainer}
                    heading="Select Information Portals"
                    headingDescription="Select from which portals you want to gather information."
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
                messageShown
                messageIconShown
            />
        </Modal>
    );
}

export default EditConnectorModal;
