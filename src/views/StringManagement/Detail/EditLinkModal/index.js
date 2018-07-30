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
import SelectInput from '#rsci/SelectInput';

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
export default class EditLinkModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            editLinkId,
            linkCollection,
        } = props;

        const link = linkCollection.find(d => d.id === editLinkId);

        this.state = {
            link,
            inputValue: link ? link.stringId : '',
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
            action: link ? 'edit' : 'add',
            key: editLinkId,
            string: inputValue,
            oldString: link ? link.stringId : undefined,
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
        const { editLinkId } = this.props;

        const properties = [
            { label: 'ID', value: editLinkId },
            { label: 'String ID', value: this.state.inputValue },
        ];
        if (link) {
            properties.push({ label: 'References', value: link ? link.refs : 0 });
        }

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

        const title = link ? 'Edit string' : 'Add string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = (link && inputValue === link.stringId) || inputValue === '';
        const Properties = this.renderProperties;

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <Properties />
                    <SelectInput
                        label={inputTitle}
                        value={inputValue}
                        onChange={this.handleInputValueChange}
                        options={allStrings}
                        keySelector={d => d.id}
                        labelSelector={d => d.string}
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
