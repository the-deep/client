import React, { useState, useCallback } from 'react';
import Faram, {
    requiredCondition,
    Schema,
} from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import Button from '#rsca/Button';
import TextArea from '#rsci/TextArea';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';

import {
    ProjectElement,
} from '#typings';

import styles from './styles.scss';

interface JoinProjectFaramValues {
    reason: string;
}
interface JoinProjectFaramErrors {}

interface JoinProjectParams {
    projectId: number;
    projectName: string;
    body: string;
}

interface Props {
    project: ProjectElement;
    onProjectJoin: (params: JoinProjectParams) => void;
    closeModal: () => void;
    projectJoinRequestPending: boolean;
}

function JoinProjectModal(props: Props) {
    const {
        project: {
            id: projectId,
            title: projectName,
        },
        closeModal,
        onProjectJoin,
        projectJoinRequestPending,
    } = props;

    const [
        joinProjectFaramValues,
        setJoinProjectFaramValues,
    ] = useState<JoinProjectFaramValues>({});
    const [
        joinProjectFaramErrors,
        setJoinProjectFaramErrors,
    ] = useState<JoinProjectFaramErrors>({});

    const [pristine, setPristine] = useState<boolean>(true);

    const handleFormChange = useCallback((faramValues, faramErrors) => {
        setJoinProjectFaramValues(faramValues);
        setJoinProjectFaramErrors(faramErrors);
        setPristine(false);
    }, [
        setJoinProjectFaramValues,
        setJoinProjectFaramErrors,
        setPristine,
    ]);

    const handleValidationSuccess = (faramValues: JoinProjectFaramValues) => {
        onProjectJoin({
            projectId,
            projectName,
            body: faramValues,
        });
    };

    const handleValidationFailure = (faramErrors: setJoinProjectFaramErrors) => {
        setJoinProjectFaramErrors(faramErrors);
    };

    const schema: Schema = {
        fields: {
            reason: [requiredCondition],
        },
    };

    return (
        <Modal
            className={styles.modal}
            closeOnEscape
        >
            <ModalHeader
                title={_ts('discoverProjects.joinProject', 'title', { projectName })}
            />
            <Faram
                schema={schema}
                onChange={handleFormChange}
                value={joinProjectFaramValues}
                error={joinProjectFaramErrors}
                onValidationSuccess={handleValidationSuccess}
                onValidationFailure={handleValidationFailure}
                disabled={projectJoinRequestPending}
            >
                <ModalBody className={styles.modalBody}>
                    <div>
                        {_ts('discoverProjects.joinProject', 'requestQuestion', { projectName })}
                    </div>
                    <TextArea
                        faramElementName="reason"
                    />
                </ModalBody>
                <ModalFooter>
                    <DangerButton
                        onClick={closeModal}
                    >
                        {_ts('discoverProjects.joinProject', 'cancel')}
                    </DangerButton>
                    <Button
                        type="submit"
                        disabled={pristine}
                        pending={projectJoinRequestPending}
                    >
                        {_ts('discoverProjects.joinProject', 'sendRequest')}
                    </Button>
                </ModalFooter>
            </Faram>
        </Modal>
    );
}

export default JoinProjectModal;
