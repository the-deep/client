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
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';

import { allStringsSelector } from '../../../../../redux';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    editStringId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    editStringId: undefined,
};

const mapStateToProps = state => ({
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
            editStringId,
        } = props;

        const string = allStrings.find(d => d.id === editStringId) || {};

        this.state = {
            string,
            inputValue: string.string || '',
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            allStrings: newAllStrings,
            editStringId: newEditStringId,
        } = nextProps;
        const {
            allStrings: oldAllStrings,
            editStringId: oldEditStringId,
        } = this.props;

        if (newEditStringId) {
            const allStringsChanged = newAllStrings !== oldAllStrings;
            const editStringIdChanged = newEditStringId !== oldEditStringId;

            if (allStringsChanged || editStringIdChanged) {
                const string = newAllStrings.find(d => d.id === newEditStringId) || {};
                this.setState({
                    string,
                    inputValue: string.string || '',
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
            editStringId,
        } = this.props;

        const { inputValue } = this.state;
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
        const { show } = this.props;

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
