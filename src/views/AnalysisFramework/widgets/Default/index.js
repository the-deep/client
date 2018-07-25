import PropTypes from 'prop-types';
import React from 'react';

import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import Faram, { requiredCondition } from '#rs/components/Input/Faram';

import _ts from '#ts';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

export default class DefaultEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
            pristine: false,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const { title } = faramValues;
        this.props.onSave(undefined, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
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
                    schema={DefaultEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody>
                        <NonFieldErrors faramElement />
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
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
