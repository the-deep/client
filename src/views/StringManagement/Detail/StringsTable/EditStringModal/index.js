import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Modal from '../../../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../../../vendor/react-store/components/View/Modal/Footer';
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

    handleInputValueChange = (value) => {
        this.setState({ inputValue: value });
    }

    render() {
        const {
            allStrings,
            editStringId,
            onClose,
            show,
        } = this.props;

        const {
            inputValue,
        } = this.state;

        if (!show) {
            return null;
        }

        const title = 'Edit string';
        const saveButtonTitle = 'Save';
        const cancelButtonTitle = 'Cancel';

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <TextInput
                        value={inputValue}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button>
                        { cancelButtonTitle }
                    </Button>
                    <SuccessButton>
                        { saveButtonTitle }
                    </SuccessButton>
                </ModalFooter>
            </Modal>
        );
    }
}
