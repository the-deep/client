import React from 'react';
import PropTypes from 'prop-types';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rscg/Faram';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

const defaultProps = { };

export default class NewManualNgramModal extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    static schema = {
        fields: {
            word: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            schema: NewManualNgramModal.schema,
            faramErrors: {},
            faramValues: {},
            pristine: true,
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (_, { word }) => {
        this.props.onSubmit(word);
    }

    handleModalClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            faramErrors,
            faramValues,
            schema,
            pristine,
        } = this.state;

        return (
            <Modal className={styles.newManualNgramModal} >
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader
                        key="header"
                        title={_ts('categoryEditor.newNgram', 'addNewWordModalTitle')}
                    />
                    <ModalBody key="body">
                        <TextInput
                            faramElementName="word"
                            label={_ts('categoryEditor.newNgram', 'addNewWordLabel')}
                            placeholder={_ts('categoryEditor.newNgram', 'addNewWordPlaceholder')}
                            autoFocus
                        />
                    </ModalBody>
                    <ModalFooter key="footer">
                        <Button onClick={this.handleModalClose}>
                            {_ts('categoryEditor.newNgram', 'modalCancel')}
                        </Button>
                        <PrimaryButton
                            className={styles.okButton}
                            disabled={pristine}
                            type="submit"
                        >
                            {_ts('categoryEditor.newNgram', 'modalOk')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
