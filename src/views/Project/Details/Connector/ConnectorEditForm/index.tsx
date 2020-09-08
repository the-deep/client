import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    listToMap,
    isDefined,
} from '@togglecorp/fujs';
import produce from 'immer';
import Faram, {
    FaramList,
    requiredCondition,
    Schema,
} from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import Message from '#rscv/Message';

import useRequest from '#restrequest';
import {
    MultiResponse,
    ConnectorSource,
    UnifiedConnectorSource,
} from '#typings';

import _ts from '#ts';

import ConnectorSourceOptions from './ConnectorSourceOptions';

import styles from './styles.scss';

const SourceOptionsEmptyComponent = () => (
    <Message>
        {_ts('project.connector.editForm', 'sourceOptionsEmptyText')}
    </Message>
);

interface ConnectorSourceButtonProps {
    title: string;
    onConnectorClick: (key: ConnectorSource['key']) => void;
    sourceKey: ConnectorSource['key'];
    active: boolean;
}

function ConnectorSourceButton(props: ConnectorSourceButtonProps) {
    const {
        title,
        onConnectorClick,
        sourceKey,
        active,
    } = props;

    const handleConnectorClick = useCallback(() => {
        onConnectorClick(sourceKey);
    }, [sourceKey, onConnectorClick]);

    return (
        <Button
            className={_cs(styles.button, active && styles.active)}
            onClick={handleConnectorClick}
        >
            {title}
        </Button>
    );
}

interface ConnectorSourceFaramInstance {
    id?: number;
    source: string;
    params: Record<string, unknown>;
}

interface Connector {
    title?: string;
    sources?: ConnectorSourceFaramInstance[];
}

interface BodyForRequest extends Connector {
    project: number;
}

const schema: Schema = {
    fields: {
        title: [requiredCondition],
        sources: {
            keySelector: d => d.source,
            member: {
                fields: {
                    id: [],
                    source: [requiredCondition],
                    params: [],
                },
            },
        },
    },
};

interface FaramErrors {}

interface OwnProps {
    className?: string;
    projectId: number;
    isAddForm?: boolean;
    connector?: Connector;
    closeModal?: () => void;
}

const unifiedConnectorSourceKeySelector = (d: UnifiedConnectorSource) => d.source;
const connectorSourceButtonKeySelector = (d: ConnectorSource) => d.key;

function ProjectConnectorEditForm(props: OwnProps) {
    const {
        projectId,
        connector,
        className,
        closeModal,
        isAddForm,
    } = props;

    const [faramValues, setFaramValues] = useState<Connector>(connector ?? {});
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();
    const [bodyToSend, setBodyToSend] = useState<BodyForRequest | undefined>(undefined);
    const [pristine, setPristine] = useState<boolean>(true);

    const [
        pendingConnectorSourcesList,
        connectorSourcesList,
    ] = useRequest<MultiResponse<ConnectorSource>>({
        url: '/connector-sources/',
    });

    const connectorSources = useMemo(() => (
        listToMap(connectorSourcesList?.results, d => d.key, d => d)
    ), [connectorSourcesList]);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        setPristine(false);
    }, [setFaramValues, setFaramErrors, setPristine]);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        console.warn('i am errored here', newFaramErrors);
        setFaramErrors(newFaramErrors);
        setPristine(true);
    }, [setFaramErrors, setPristine]);

    const handleFaramValidationSucces = useCallback((finalFaramValues) => {
        console.warn('here', finalFaramValues);
        setBodyToSend({
            project: projectId,
            ...finalFaramValues,
        });
    }, [setBodyToSend, projectId]);

    const [pending] = useRequest({
        url: isDefined(bodyToSend) ? `/projects/${projectId}/unified-connectors/` : undefined,
        method: 'POST',
        body: bodyToSend,
    }, {
        onSuccess: (response) => {
            console.warn('here', response);
        },
    });

    const connectorSourceOptionsRendererParams = useCallback((key, data, index) => ({
        index,
        options: connectorSources[data.source]?.options,
        title: connectorSources[data.source]?.title,
        sourceKey: data.key,
    }), [connectorSources]);

    const handleConnectorAdd = useCallback((connectorSourceKey) => {
        setFaramValues((currentFaramValues) => {
            const newFaramValues = produce(currentFaramValues, (safeFaramValues) => {
                if (!safeFaramValues.sources) {
                    // eslint-disable-next-line no-param-reassign
                    safeFaramValues.sources = [];
                }
                const selectedSourceIndex = safeFaramValues.sources
                    .findIndex(s => s.source === connectorSourceKey);

                if (selectedSourceIndex === -1) {
                    safeFaramValues.sources.push({
                        source: connectorSourceKey,
                        params: {},
                    });
                } else {
                    safeFaramValues.sources.splice(selectedSourceIndex, 1);
                }
            });
            return newFaramValues;
        });
    }, [setFaramValues]);

    const connectorSourceButtonRendererParams = useCallback((key, data, index) => {
        const active = faramValues.sources
            && faramValues.sources.findIndex(s => s.source === key) !== -1;

        return ({
            index,
            title: data.title,
            sourceKey: data.key,
            onConnectorClick: handleConnectorAdd,
            active,
        });
    }, [handleConnectorAdd, faramValues]);

    return (
        <Modal className={_cs(className, styles.connectorEditForm)}>
            <ModalHeader
                className={styles.modalHeader}
                title={isAddForm
                    ? _ts('project.connector.editForm', 'addConnectorTitle')
                    : _ts('project.connector.editForm', 'editConnectorTitle')
                }
                rightComponent={(
                    <Button
                        iconName="close"
                        onClick={closeModal}
                        transparent
                    />
                )}
            />
            <Faram
                className={styles.form}
                onChange={handleFaramChange}
                onValidationFailure={handleFaramValidationFailure}
                onValidationSuccess={handleFaramValidationSucces}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                <ModalBody className={styles.modalBody}>
                    {pending && <LoadingAnimation />}
                    <TextInput
                        className={styles.title}
                        faramElementName="title"
                        label={_ts('project.connector.editForm', 'connectorTitleLabel')}
                    />
                    <FaramList
                        faramElementName="sources"
                        keySelector={unifiedConnectorSourceKeySelector}
                    >
                        <header className={styles.sourcesSelectionHeader}>
                            <span className={styles.label}>
                                {_ts('project.connector.editForm', 'connectorSourcesSelection')}
                            </span>
                        </header>
                        <ListView
                            className={styles.sourcesSelectionButtons}
                            data={connectorSourcesList && connectorSourcesList.results}
                            renderer={ConnectorSourceButton}
                            rendererParams={connectorSourceButtonRendererParams}
                            keySelector={connectorSourceButtonKeySelector}
                        />
                        <ListView
                            className={styles.sourceOptions}
                            faramElement
                            renderer={ConnectorSourceOptions}
                            rendererParams={connectorSourceOptionsRendererParams}
                            keySelector={unifiedConnectorSourceKeySelector}
                            emptyComponent={SourceOptionsEmptyComponent}
                        />
                    </FaramList>
                </ModalBody>
                <ModalFooter className={styles.modalFooter}>
                    <DangerButton onClick={closeModal} >
                        {_ts('project.connector.editForm', 'cancelButtonLabel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pristine}
                        type="submit"
                    >
                        {_ts('project.connector.editForm', 'saveButtonLabel')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        </Modal>
    );
}

export default ProjectConnectorEditForm;
