import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import TextInput from '#rs/components/Input/TextInput';

import Faram, { requiredCondition } from '#rs/components/Input/Faram';

import _ts from '#ts';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default class Excerpt extends React.PureComponent {
    static propTypes = propTypes;

    static schema = {
        fields: {
            title: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const { title } = props;
        this.state = {
            faramValues: { title },
            faramErrors: {},
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const { title } = faramValues;
        this.props.onSave(undefined, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        return (
            <Modal>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Excerpt.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <TextInput
                            faramElementName="title"
                            autoFocus
                            label={_ts('framework.excerptWidget', 'titleLabel')}
                            placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                            selectOnFocus
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton type="submit">
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
