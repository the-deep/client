import React from 'react';
import PropTypes from 'prop-types';
import produce from 'immer';
import Faram, { requiredCondition } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ColorInput from '#rsci/ColorInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';

import styles from './styles.scss';

const schema = {
    fields: {
        title: [requiredCondition],
        color: [],
    },
};

const colorsForPolygons = [
    '#a6cee3',
    '#1f78b4',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#b15928',
];

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default class PolygonEditModal extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        const { value } = props;

        const {
            geoJson: {
                properties: {
                    title,
                    color,
                },
            },
        } = value;

        this.state = {
            faramValues: {
                title,
                color,
            },
            faramErrors: {},
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

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            value,
        } = this.props;

        const newValue = produce(value, (safeValue) => {
            // eslint-disable-next-line no-param-reassign
            safeValue.geoJson.properties.title = faramValues.title;
            // eslint-disable-next-line no-param-reassign
            safeValue.geoJson.properties.color = faramValues.color;
        });

        onSave(newValue);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;
        const {
            value,
            onClose,
        } = this.props;

        return (
            <Modal>
                <ModalHeader
                    title={_ts('components.geo.geoModal.polygonModal', 'title', { type: value.type })}
                />
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <NonFieldErrors faramElement />
                    <ModalBody className={styles.modalBody}>
                        <TextInput
                            faramElementName="title"
                            label={_ts('components.geo.geoModal.polygonModal', 'titleInputLabel')}
                            autoFocus
                        />
                        <ColorInput
                            className={styles.colorInput}
                            faramElementName="color"
                            colors={colorsForPolygons}
                            label={_ts('components.geo.geoModal.polygonModal', 'colorInputLabel')}
                            type="githubPicker"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={onClose}
                        >
                            {_ts('components.geo.geoModal.polygonModal', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine}
                        >
                            {_ts('components.geo.geoModal.polygonModal', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
