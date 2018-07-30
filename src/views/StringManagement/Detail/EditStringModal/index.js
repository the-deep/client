import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import SuccessButton from '#rsca/Button/SuccessButton';
import TextInput from '#rsci/TextInput';

import {
    allStringsSelector,
    selectedLanguageNameSelector,
    stringMgmtAddStringChangeAction,
} from '#redux';
import styles from './styles.scss';

const propTypes = {
    editStringId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),

    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
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

        const string = editStringId
            ? allStrings.find(d => d.id === editStringId)
            : undefined;

        this.state = {
            string,
            inputValue: string ? string.string : '',
        };
    }

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    handleSaveButtonClick = () => {
        const {
            onClose,
            editStringId,

            selectedLanguageName,
            addStringChange,
        } = this.props;

        const {
            inputValue,
            string,
        } = this.state;

        // FIXME: use isFalsy here
        const id = editStringId || Math.floor(-100000000 * Math.random());

        const change = {
            action: string ? 'edit' : 'add',
            id,
            value: inputValue,
            oldValue: string ? string.string : undefined,
        };

        addStringChange({
            change,
            languageName: selectedLanguageName,
        });

        onClose(true, id, inputValue);
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

        if (!string) {
            return null;
        }

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

        const title = string ? 'Edit string' : 'Add string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = (string && inputValue === string.string) || inputValue === '';

        const Properties = this.renderProperties;

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <Properties />
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
