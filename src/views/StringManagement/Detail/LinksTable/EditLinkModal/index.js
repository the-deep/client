import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '../../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../../../vendor/react-store/components/View/Modal/Footer';
import ListView from '../../../../../vendor/react-store/components/View/List/ListView';
import Button from '../../../../../vendor/react-store/components/Action/Button';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';

import {
    linkCollectionSelector,
    allStringsSelector,
} from '../../../../../redux';
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
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    editLinkId: undefined,
};

const mapStateToProps = state => ({
    linkCollection: linkCollectionSelector(state),
    allStrings: allStringsSelector(state),
});

@connect(mapStateToProps)
export default class EditStringModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const {
            allStrings,
            editLinkId,
            linkCollection,
        } = props;

        const string = allStrings.find(d => d.id === editLinkId) || {};
        const link = linkCollection.find(d => d.stringId === editLinkId) || {};

        this.state = {
            string,
            inputValue: string.id,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            allStrings: newAllStrings,
            editLinkId: newEditLinkId,
            linkCollection,
        } = nextProps;
        const {
            allStrings: oldAllStrings,
            editLinkId: oldEditLinkId,
        } = this.props;

        if (newEditLinkId) {
            const linkCollectionChanged = newAllStrings !== oldAllStrings;
            const editStringIdChanged = newEditLinkId !== oldEditLinkId;

            if (linkCollectionChanged || editStringIdChanged) {
                const string = newAllStrings.find(d => d.id === newEditLinkId) || {};
                const link = linkCollection.find(d => d.stringId === newEditLinkId) || {};

                this.setState({
                    string,
                    inputValue: string.id,
                    link,
                });
            }
        }
    }

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    handleSaveButtonClick = () => {
        const {
            onClose,
            editLinkId,
        } = this.props;

        const { inputValue } = this.state;
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
        const {
            string,
            link = {},
        } = this.state;

        const properties = [
            { label: 'ID', value: link.id },
            { label: 'String id', value: string.id },
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
            show,
            allStrings,
            editLinkId,
        } = this.props;

        const {
            string,
            inputValue,
        } = this.state;

        if (!show) {
            return null;
        }

        const title = 'Edit string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';
        const inputTitle = 'String';

        const saveButtonDisabled = inputValue === string.id;
        const Properties = this.renderProperties;
        console.warn(inputValue, editLinkId);

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
