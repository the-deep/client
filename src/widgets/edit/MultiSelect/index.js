import PropTypes from 'prop-types';
import React from 'react';

import FaramList from '#rscg/FaramList';
import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import NonFieldErrors from '#rsci/NonFieldErrors';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Faram, { requiredCondition } from '#rscg/Faram';
import { findDuplicates, randomString } from '#rsu/common';

import { iconNames } from '#constants';
import _ts from '#ts';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
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

                    const duplicates = findDuplicates(options, o => o.label);
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
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({
            faramErrors,
            hasError: true,
        });
    };

    handleFaramValidationSuccess = (_, faramValues) => {
        const { title, ...otherProps } = faramValues;
        this.props.onSave(otherProps, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
            hasError,
        } = this.state;
        const {
            onClose,
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
                                        iconName={iconNames.add}
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
                            onClick={onClose}
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
