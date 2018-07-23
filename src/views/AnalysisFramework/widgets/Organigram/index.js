import PropTypes from 'prop-types';
import React from 'react';

import {
    randomString,
    isFalsy,
} from '#rs/utils/common';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import update from '#rs/utils/immutable-update';

import Faram, { requiredCondition } from '#rs/components/Input/Faram';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const baseOrgan = {
    key: 'base',
    title: 'Base',
    organs: [],
};

const defaultProps = {
    data: baseOrgan,
};

// TODO: move this later to public
const buildSettings = (indices, action, value, wrapper) => (
    // NOTE: reverse() mutates the array so making a copy
    [...indices].reverse().reduce(
        (acc, selected, index) => wrapper(
            { [selected]: acc },
            indices.length - index - 1,
        ),
        wrapper(
            { [action]: value },
            indices.length,
        ),
    )
);

export default class Organigram extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static schema = {
        fields: {
            title: [requiredCondition],
        },
    };

    constructor(props) {
        super(props);

        const {
            title,
            data: organigram,
        } = props;
        this.state = {
            faramValues: {
                title,
                organigram,
            },
            faramErrors: {},
            organigram: props.data || baseOrgan,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({ organigram: nextProps.data || baseOrgan });
        }
    }

    getValuesForOrgan = (organ, parentLabel) => {
        const label = parentLabel ? `${parentLabel} / ${organ.title}` : organ.title;
        return [
            {
                key: organ.key,
                label,
            },
            ...organ.organs.reduce((acc, o) => acc.concat(this.getValuesForOrgan(o, label)), []),
        ];
    }

    handleAdd = nextIndices => () => {
        const wrapper = e => ({ organs: e });
        const key = `Organ ${randomString()}`;
        const organsSetting = buildSettings(
            nextIndices,
            '$push',
            [{ key, title: '', organs: [] }],
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleRemove = (indices, j) => () => {
        const wrapper = e => ({ organs: e });
        const organsSetting = buildSettings(
            indices,
            '$splice',
            [[j, 1]],
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };
    handleChange = nextIndices => (value) => {
        const wrapper = (e, i) => (
            i === nextIndices.length ? { title: e } : { organs: e }
        );
        const organsSetting = buildSettings(
            nextIndices,
            '$set',
            value,
            wrapper,
        );
        const newOrganigram = update(this.state.organigram, organsSetting);
        this.setState({ organigram: newOrganigram });
    };


    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            pristine: false,
        });
    };

    handleFaramValidationSuccess = (faramValues) => {
        const {
            title,
            organigram,
        } = faramValues;
        this.props.onSave(organigram, title);
    };

    renderOrgan = (organ, indices = [], j) => {
        const isFatherOrgan = isFalsy(j);
        const nextIndices = isFatherOrgan ? indices : [...indices, j];

        const organPlaceholder = _ts('framework.organigramWidget', 'organPlaceholder');
        const addChildButtonTitle = _ts('framework.organigramWidget', 'addChildButtonTitle');
        const removeElementButtonTitle = _ts('framework.organigramWidget', 'removeElementButtonTitle');

        return (
            <div
                className={styles.organ}
                key={organ.key}
            >
                <div className={styles.organHeader}>
                    <TextInput
                        value={organ.title}
                        className={styles.titleInput}
                        showHintAndError={false}
                        placeholder={organPlaceholder}
                        showLabel={false}
                        onChange={this.handleChange(nextIndices)}
                        autoFocus
                    />
                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            className={styles.actionButton}
                            onClick={this.handleAdd(nextIndices)}
                            title={addChildButtonTitle}
                            tabIndex="-1"
                            transparent
                            iconName="ion-fork-repo"
                        />
                        {
                            !isFatherOrgan && (
                                <DangerButton
                                    className={styles.actionButton}
                                    onClick={this.handleRemove(indices, j)}
                                    title={removeElementButtonTitle}
                                    tabIndex="-1"
                                    transparent
                                    iconName="ion-trash-b"
                                />
                            )
                        }
                    </div>
                </div>
                <div className={styles.organBody}>
                    {
                        organ.organs.map(
                            (childOrgan, i) => this.renderOrgan(childOrgan, nextIndices, i),
                        )
                    }
                </div>
            </div>
        );
    };

    render() {
        const {
            organigram,
            faramValues,
            faramErrors,
            pristine,
        } = this.state;
        const {
            onClose,
            title,
        } = this.props;

        const textInputLabel = _ts('framework.organigramWidget', 'titleLabel');
        const textInputPlaceholder = _ts('framework.organigramWidget', 'titlePlaceholderScale');
        const cancelButtonLabel = _ts('framework.organigramWidget', 'cancelButtonLabel');
        const saveButtonLabel = _ts('framework.organigramWidget', 'saveButtonLabel');

        return (
            <Modal className={styles.editModal}>
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={Organigram.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors faramElement />
                        <div className={styles.titleInputContainer}>
                            <TextInput
                                className={styles.titleInput}
                                faramElementName="title"
                                label={textInputLabel}
                                placeholder={textInputPlaceholder}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
                            />
                        </div>
                        <div className={styles.organs}>
                            { this.renderOrgan(organigram) }
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
