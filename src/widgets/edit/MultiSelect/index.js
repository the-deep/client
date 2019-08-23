import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramList, requiredCondition } from '@togglecorp/faram';
import { getDuplicates, randomString } from '@togglecorp/fujs';

import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';

import _ts from '#ts';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    widgetKey: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

export default class MultiSelectEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = elem => elem.key;

    static schema = {
        fields: {
            title: [requiredCondition],
            options: {
                validation: (options) => {
                    const errors = [];
                    if (!options || options.length <= 0) {
                        errors.push(_ts('widgets.editor.multiselect', 'atLeastOneError'));
                    }

                    const duplicates = getDuplicates(options, o => o.label);
                    if (duplicates.length > 0) {
                        errors.push(_ts(
                            'widgets.editor.multiselect',
                            'duplicationError',
                            { duplicates: duplicates.join(', ') },
                        ));
                    }
                    return errors;
                },
                keySelector: MultiSelectEditWidget.keySelector,
                member: {
                    fields: {
                        label: [requiredCondition],
                        key: [requiredCondition],
                    },
                },
                /*
                member: {
                    email: {
                        fields: {
                            label: [requiredCondition, emailCondition],
                            key: [requiredCondition],
                        },
                    },
                    default: {
                        fields: {
                            label: [requiredCondition],
                            key: [requiredCondition],
                        },
                    },
                },
                identifier: (val) => {
                    if (val.label && val.label.length > 10) {
                        return 'email';
                    }
                    return 'default';
                },
                */
            },
        },
    };

    static optionAddClick = options => ([
        ...options,
        {
            key: randomString(16),
            label: '',
        },
    ])

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    static getDataFromFaramValues = (data) => {
        const {
            title, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
            ...otherValues
        } = data;
        return otherValues;
    };

    static getTitleFromFaramValues = data => data.title;

    constructor(props) {
        super(props);

        const {
            title,
            data: { options },
        } = props;
        this.state = {
            faramValues: { title, options },
            faramErrors: {},
            pristine: true,
        };
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });

        const {
            widgetKey,
            onChange,
        } = this.props;
        onChange(
            widgetKey,
            MultiSelectEditWidget.getDataFromFaramValues(faramValues),
            MultiSelectEditWidget.getTitleFromFaramValues(faramValues),
        );
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const {
            onSave,
            closeModal,
            widgetKey,
        } = this.props;

        onSave(
            widgetKey,
            MultiSelectEditWidget.getDataFromFaramValues(faramValues),
            MultiSelectEditWidget.getTitleFromFaramValues(faramValues),
        );
        closeModal();
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;
        const {
            closeModal,
            title,
        } = this.props;

        const cancelButtonLabel = _ts('widgets.editor.multiselect', 'cancelButtonLabel');
        const saveButtonLabel = _ts('widgets.editor.multiselect', 'saveButtonLabel');
        const cancelConfirmMessage = _ts('widgets.editor.multiselect', 'cancelConfirmMessage');

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={MultiSelectEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                        />
                        <TextInput
                            faramElementName="title"
                            className={styles.title}
                            autoFocus
                            selectOnFocus
                            label={_ts('widgets.editor.multiselect', 'titleLabel')}
                            placeholder={_ts('widgets.editor.multiselect', 'widgetTitlePlaceholder')}
                        />
                        <div className={styles.optionInputs} >
                            <FaramList
                                faramElementName="options"
                                keySelector={MultiSelectEditWidget.keySelector}
                            >
                                <NonFieldErrors
                                    className={styles.nonFieldErrors}
                                    faramElement
                                />
                                <header className={styles.header}>
                                    <h4>
                                        {_ts('widgets.editor.multiselect', 'optionsHeader')}
                                    </h4>
                                    <PrimaryButton
                                        faramElementName="add-btn"
                                        faramAction={MultiSelectEditWidget.optionAddClick}
                                        iconName="add"
                                        transparent
                                    >
                                        {_ts('widgets.editor.multiselect', 'addOptionButtonLabel')}
                                    </PrimaryButton>
                                </header>
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    rendererParams={MultiSelectEditWidget.rendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={cancelConfirmMessage}
                            skipConfirmation={pristine}
                        >
                            {cancelButtonLabel}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {saveButtonLabel}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
