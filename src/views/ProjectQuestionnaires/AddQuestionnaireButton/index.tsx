import React from 'react';

import modalize from '#rscg/Modalize';
import AccentButton from '#rsca/Button/AccentButton';
import Button from '#rsca/Button';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import AddQuestionnaireForm from './AddQuestionnaireForm';

const ModalButton = modalize(AccentButton);

interface Props {
}

const AddQuestionnaireModal = (p) => {
    const { closeModal } = p;

    return (
        <Modal>
            <ModalHeader
                title="Add questionnaire"
                rightComponent={
                    <Button
                        iconName="close"
                        onClick={closeModal}
                    />
                }
            />
            <ModalBody>
                <AddQuestionnaireForm />
            </ModalBody>
        </Modal>
    );
};

class AddQuestionnaireButton extends React.PureComponent<Props> {
    public render() {
        return (
            <ModalButton
                {...this.props}
                modal={<AddQuestionnaireModal />}
            >
                Add questionnaire
            </ModalButton>
        );
    }
}

export default AddQuestionnaireButton;
