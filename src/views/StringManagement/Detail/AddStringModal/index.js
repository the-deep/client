import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import Button from '#rs/components/Action/Button';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import TextInput from '#rs/components/Input/TextInput';

import {
    selectedLanguageNameSelector,
    stringMgmtAddStringChangeAction,
} from '#redux';

const propTypes = {
    onClose: PropTypes.func.isRequired,
    selectedLanguageName: PropTypes.string.isRequired,
    addStringChange: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    selectedLanguageName: selectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addStringChange: params => dispatch(stringMgmtAddStringChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class AddStringModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
        };
    }

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    handleSaveButtonClick = () => {
        const {
            onClose,

            selectedLanguageName,
            addStringChange,
        } = this.props;

        const { inputValue } = this.state;
        const change = {
            action: 'add',
            id: Math.floor(-100000000 * Math.random()),
            value: inputValue,
        };

        addStringChange({
            change,
            languageName: selectedLanguageName,
        });

        onClose(true, inputValue);
    }

    handleCancelButtonClick = () => {
        const { onClose } = this.props;
        onClose(false);
    }


    render() {
        const { inputValue } = this.state;

        const title = 'Add string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = inputValue.length === 0 || inputValue === '';

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <TextInput
                        label={inputTitle}
                        value={inputValue}
                        onChange={this.handleInputValueChange}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelButtonClick}>
                        { cancelButtonTitle }
                    </Button>
                    <SuccessButton
                        onClick={this.handleSaveButtonClick}
                        disabled={saveButtonDisabled}
                    >
                        { saveButtonTitle }
                    </SuccessButton>
                </ModalFooter>
            </Modal>
        );
    }
}
