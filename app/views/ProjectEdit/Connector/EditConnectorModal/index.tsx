import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { useMutation, gql } from '@apollo/client';
import {
    Modal,
    TextInput,
    Message,
} from '@the-deep/deep-ui';

import {
    schema,
    getDefaultValues,
} from '../schema';

import styles from './styles.css';

const CREATE_CONNECTOR = gql`
    mutation ProjectConnectorCreate(
        $input: UnifiedConnectorInputType!,
        $projectId: ID!,
    ) {
        project(id: $projectId) {
            unifiedConnector {
                unifiedConnectorCreate(data: $input) {
                    errors
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
    console.warn('here', projectId);

    const defaultValue = useMemo(() => getDefaultValues(), []);

    const {
        value,
        error: riskyError,
        setFieldValue,
    } = useForm(schema, defaultValue);

    const error = getErrorObject(riskyError);

    return (
        <Modal
            className={_cs(styles.editConnectorModal, className)}
            onCloseButtonClick={onClose}
            size="cover"
            heading={connectorId ?? 'Add New Connector'}
            bodyClassName={styles.body}
        >
            <div className={styles.leftContainer}>
                <TextInput
                    name="title"
                    label="Title"
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
            </div>
            <div className={styles.rightContainer}>
                <Message
                    message="Please select sources."
                />
            </div>
        </Modal>
    );
}

export default EditConnectorModal;
