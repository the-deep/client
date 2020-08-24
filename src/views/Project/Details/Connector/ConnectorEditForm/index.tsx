import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram, { requiredCondition } from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import _ts from '#ts';

import styles from './styles.scss';

interface Connector {
}

const schema = {
    title: [requiredCondition],
};

interface FaramErrors {}

interface OwnProps {
    className?: string;
    projectId: number;
    isAddForm?: boolean;
    connector?: Connector;
    closeModal?: () => void;
}

function ProjectConnectorEditForm(props: OwnProps) {
    const {
        projectId,
        connector,
        className,
        closeModal,
        isAddForm,
    } = props;

    const [faramValues, setFaramValues] = useState<Connector | undefined>(connector);
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();
    const [pristine, setPristine] = useState<boolean>(true);

    const pending = false;

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
        setPristine(false);
    }, [setFaramValues, setFaramErrors, setPristine]);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
        setPristine(true);
    }, [setFaramErrors, setPristine]);

    const handleFaramValidationSucces = useCallback((finalFaramValues) => {
        console.warn('here', finalFaramValues);
    }, []);

    return (
        <Modal className={_cs(className, styles.connectorEditForm)}>
            <ModalHeader
                className={styles.modalHeader}
                title={isAddForm
                    ? _ts('project.connector.editForm', 'addConnectorTitle')
                    : _ts('project.connector.editForm', 'editConnectorTitle')
                }
                headingClassName={styles.heading}
                rightComponent={(
                    <Button
                        iconName="close"
                        onClick={closeModal}
                        transparent
                    />
                )}
            />
            <Faram
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
                        faramElementName="title"
                        label={_ts('project.connector.editForm', 'connectorTitleLabel')}
                    />
                </ModalBody>
                <ModalFooter>
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
