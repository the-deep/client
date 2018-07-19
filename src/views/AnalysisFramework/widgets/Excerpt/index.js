import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalHeader from '#rs/components/View/Modal/Header';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import TextInput from '#rs/components/Input/TextInput';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    // onChange: PropTypes.func.isRequired,
};

export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const { title } = props;
        this.state = { title };
    }

    handleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleSave = () => {
        this.props.onSave(undefined, this.state.title);
    }

    render() {
        const { title } = this.state;

        const cancelButtonLabel = 'Cancel';
        const saveButtonLabel = 'Save';

        return (
            <Modal>
                <ModalHeader title={title} />
                <ModalBody>
                    <TextInput
                        autoFocus
                        label={_ts('framework.excerptWidget', 'titleLabel')}
                        onChange={this.handleWidgetTitleChange}
                        placeholder={_ts('framework.excerptWidget', 'widgetTitlePlaceholder')}
                        selectOnFocus
                        showHintAndError={false}
                        value={title}
                    />
                </ModalBody>
                <ModalFooter>
                    <DangerButton onClick={this.props.onClose}>
                        {cancelButtonLabel}
                    </DangerButton>
                    <PrimaryButton onClick={this.handleSave}>
                        {saveButtonLabel}
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
