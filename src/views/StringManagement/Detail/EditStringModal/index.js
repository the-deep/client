import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ListView from '#rs/components/View/List/ListView';
import Button from '#rs/components/Action/Button';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import TextInput from '#rs/components/Input/TextInput';

import {
    allStringsSelector,
    selectedLanguageNameSelector,
    stringMgmtAddStringChangeAction,
} from '#redux';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    editStringId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onClose: PropTypes.func.isRequired,
    selectedLanguageName: PropTypes.string.isRequired,
    addStringChange: PropTypes.func.isRequired,
};

const defaultProps = {
    editStringId: undefined,
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addStringChange: params => dispatch(stringMgmtAddStringChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditStringModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            allStrings,
            editStringId,
        } = props;

        const string = allStrings.find(d => d.id === editStringId) || {};

        this.state = {
            string,
            inputValue: string.string || '',
        };
    }

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    handleSaveButtonClick = () => {
        const {
            onClose,
            editStringId,
            allStrings,

            selectedLanguageName,
            addStringChange,
        } = this.props;

        const { inputValue } = this.state;
        const val = allStrings.find(d => d.id === editStringId).string;
        const change = {
            action: 'edit',
            id: editStringId,
            value: inputValue,
            oldValue: val,
        };

        addStringChange({
            change,
            languageName: selectedLanguageName,
        });

        onClose(true, editStringId, inputValue);
    }

    handleCancelButtonClick = () => {
        const { onClose } = this.props;
        onClose(false);
    }

    renderProperty = (k, property) => (
        <div
            className={styles.property}
            key={property.label}
        >
            <div className={styles.label}>
                { property.label }
            </div>
            <div className={styles.value}>
                { property.value }
            </div>
        </div>
    );

    renderProperties = () => {
        const { string } = this.state;

        const properties = [
            { label: 'ID', value: string.id },
            { label: 'References', value: string.refs },
        ];

        return (
            <ListView
                className={styles.properties}
                data={properties}
                modifier={this.renderProperty}
            />
        );
    }

    render() {
        const {
            string,
            inputValue,
        } = this.state;

        const title = 'Edit string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = inputValue.length === 0 || inputValue === string.string;

        const Properties = this.renderProperties;

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <TextInput
                        label={inputTitle}
                        value={inputValue}
                        onChange={this.handleInputValueChange}
                    />
                    <Properties />
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
