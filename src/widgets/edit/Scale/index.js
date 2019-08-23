import PropTypes from 'prop-types';
import React from 'react';
import Faram, {
    FaramList,
    requiredCondition,
} from '@togglecorp/faram';
import { getDuplicates, randomString, removeKey } from '@togglecorp/fujs';

import NonFieldErrors from '#rsci/NonFieldErrors';
import SortableListView from '#rscv/SortableListView';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import _ts from '#ts';

import InputRow from './InputRow';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    onSave: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/no-unused-prop-types, max-len
};

const defaultProps = {
    data: {},
};

const emptyList = [];

export default class ScaleEditWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = scaleUnit => scaleUnit.key;

    static faramTransform = {
        inbound: (data) => {
            const {
                defaultScaleUnit,
                scaleUnits: oldScaleUnits,
                ...otherData
            } = data;
            const { keySelector } = ScaleEditWidget;

            // For each unit, add a `defaultScaleUnit` boolean value
            const scaleUnits = oldScaleUnits.map(unit => ({
                ...unit,
                defaultScaleUnit: keySelector(unit) === defaultScaleUnit,
            }));

            return {
                ...otherData,
                scaleUnits,
            };
        },

        outbound: (value, oldValue) => {
            const {
                scaleUnits,
                ...otherData
            } = value;
            const { keySelector } = ScaleEditWidget;

            // We want to only keep one of the default values
            // clearing others if multiple was selected.
            // This happens, when user first selects one default value and
            // then select another.
            const possibleDefaultValues = scaleUnits.filter(v => v.defaultScaleUnit);

            // Find the new default value which was not the old default value
            const newDefaultValue = possibleDefaultValues.find(
                v => keySelector(v) !== oldValue.defaultScaleUnit,
            );

            return {
                ...otherData,
                scaleUnits: scaleUnits.map(v => removeKey(v, 'defaultScaleUnit')),
                defaultScaleUnit: newDefaultValue && keySelector(newDefaultValue),
            };
        },
    }

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    static schema = {
        fields: {
            title: [requiredCondition],
            defaultScaleUnit: [],
            scaleUnits: {
                validation: (scaleUnits) => {
                    const errors = [];
                    if (!scaleUnits || scaleUnits.length <= 0) {
                        errors.push(_ts('widgets.editor.scale', 'requiredErrorMessage'));
                    }

                    const duplicates = getDuplicates(scaleUnits, o => o.label);
                    if (duplicates.length > 0) {
                        errors.push(
                            _ts('widgets.editor.scale', 'duplicateErrorMessage', {
                                duplicates: duplicates.join(', '),
                            }),
                        );
                    }
                    return errors;
                },
                keySelector: ScaleEditWidget.keySelector,
                member: {
                    fields: {
                        key: [requiredCondition],
                        label: [requiredCondition],
                        color: [],
                    },
                },
            },
        },
    };

    static addOptionClick = options => ([
        ...options,
        { key: randomString(16) },
    ])

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
            data: {
                scaleUnits = emptyList,
                defaultScaleUnit,
            },
        } = props;

        this.state = {
            faramValues: {
                title,
                scaleUnits,
                defaultScaleUnit,
            },
            faramErrors: {},
            pristine: true,
            hasError: false,
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
            ScaleEditWidget.getDataFromFaramValues(faramValues),
            ScaleEditWidget.getTitleFromFaramValues(faramValues),
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
            ScaleEditWidget.getDataFromFaramValues(faramValues),
            ScaleEditWidget.getTitleFromFaramValues(faramValues),
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
            title,
            closeModal,
        } = this.props;

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ScaleEditWidget.schema}
                    value={faramValues}
                    error={faramErrors}
                    faramInboundTransform={ScaleEditWidget.faramTransform.inbound}
                    faramOutboundTransform={ScaleEditWidget.faramTransform.outbound}
                >
                    <ModalHeader title={title} />
                    <ModalBody className={styles.body}>
                        <NonFieldErrors
                            className={styles.nonFieldErrors}
                            faramElement
                        />
                        <TextInput
                            className={styles.title}
                            faramElementName="title"
                            label={_ts('widgets.editor.scale', 'titleLabel')}
                            placeholder={_ts('widgets.editor.scale', 'titlePlaceholderScale')}
                            showHintAndError
                            autoFocus
                            selectOnFocus
                        />
                        <div className={styles.scaleUnits}>
                            <FaramList
                                faramElementName="scaleUnits"
                                keySelector={ScaleEditWidget.keySelector}
                            >
                                <NonFieldErrors
                                    className={styles.nonFieldErrors}
                                    faramElement
                                />
                                <header className={styles.header}>
                                    <h4>
                                        {_ts('widgets.editor.scale', 'addOptionHeadingLabel')}
                                    </h4>
                                    <PrimaryButton
                                        faramElementName="add-btn"
                                        faramAction={ScaleEditWidget.addOptionClick}
                                        iconName="add"
                                        transparent
                                    >
                                        {_ts('widgets.editor.scale', 'addOptionButtonLabel')}
                                    </PrimaryButton>
                                </header>
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    rendererParams={ScaleEditWidget.rendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerConfirmButton
                            onClick={closeModal}
                            confirmationMessage={_ts('widgets.editor.scale', 'cancelConfirmMessage')}
                            skipConfirmation={pristine}
                        >
                            {_ts('widgets.editor.scale', 'cancelButtonLabel')}
                        </DangerConfirmButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {_ts('widgets.editor.scale', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
