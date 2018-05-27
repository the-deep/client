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
import SelectInput from '#rs/components/Input/SelectInput';

import {
    linkCollectionSelector,
    allStringsSelector,
    selectedLanguageNameSelector,
    stringMgmtAddLinkChangeAction,
    selectedLinkCollectionNameSelector,
} from '#redux';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,

    editLinkId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onClose: PropTypes.func.isRequired,
    selectedLanguageName: PropTypes.string.isRequired,
    selectedLinkCollectionName: PropTypes.string.isRequired,
    addLinkChange: PropTypes.func.isRequired,
};

const defaultProps = {
    editLinkId: undefined,
};

const mapStateToProps = state => ({
    linkCollection: linkCollectionSelector(state),
    allStrings: allStringsSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
    selectedLinkCollectionName: selectedLinkCollectionNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addLinkChange: params => dispatch(stringMgmtAddLinkChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditStringModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            editLinkId,
            linkCollection,
        } = props;

        // const string = allStrings.find(d => d.id === editLinkId) || {};
        console.warn(linkCollection, editLinkId);
        const link = linkCollection.find(d => d.id === editLinkId) || {};

        console.warn(link);

        this.state = {
            link,
            inputValue: link.stringId,
        };
    }

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    handleSaveButtonClick = () => {
        const {
            onClose,
            editLinkId,
            selectedLanguageName,
            selectedLinkCollectionName,
            addLinkChange,
        } = this.props;
        const {
            link,
            inputValue,
        } = this.state;

        const change = {
            action: 'edit',
            key: link.id,
            string: inputValue,
            oldString: link.stringId,
        };

        addLinkChange({
            change,
            languageName: selectedLanguageName,
            linkCollectionName: selectedLinkCollectionName,
        });

        onClose(true, editLinkId, inputValue);
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
        const { link } = this.state;

        const properties = [
            { label: 'ID', value: link.id },
            { label: 'String ID', value: link.stringId },
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
            allStrings,
        } = this.props;

        const {
            link,
            inputValue,
        } = this.state;

        const title = 'Edit string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = inputValue === link.string;
        const Properties = this.renderProperties;

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <SelectInput
                        label={inputTitle}
                        value={inputValue}
                        onChange={this.handleInputValueChange}
                        options={allStrings}
                        keySelector={d => d.id}
                        labelSelector={d => d.string}
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
