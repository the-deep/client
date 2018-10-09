import PropTypes from 'prop-types';
import React from 'react';

import Faram, {
    requiredCondition,
} from '#rscg/Faram';
import FaramList from '#rscg/FaramList';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SortableListView from '#rscv/SortableListView';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import { findDuplicates, randomString, removeKey } from '#rsu/common';

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

const emptyList = [];

export default class ScaleFrameworkList extends React.PureComponent {
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
            const { keySelector } = ScaleFrameworkList;

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
            const { keySelector } = ScaleFrameworkList;

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

                    const duplicates = findDuplicates(scaleUnits, o => o.label);
                    if (duplicates.length > 0) {
                        errors.push(
                            _ts('widgets.editor.scale', 'duplicateErrorMessage', {
                                duplicates: duplicates.join(', '),
                            }),
                        );
                    }
                    return errors;
                },
                keySelector: ScaleFrameworkList.keySelector,
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
        { key: randomString(16).toLowerCase() },
    ])

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
            pristine: false,
        };
    }

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

    handleFaramValidationSuccess = (_, faramValues) => {
        const { title, ...otherProps } = faramValues;
        this.props.onSave(otherProps, title);
    };

    render() {
        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;
        const {
            title,
            onClose,
        } = this.props;

        return (
            <Modal className={styles.editModal}>
                <Faram
                    className={styles.form}
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={ScaleFrameworkList.schema}
                    value={faramValues}
                    error={faramErrors}
                    faramInboundTransform={ScaleFrameworkList.faramTransform.inbound}
                    faramOutboundTransform={ScaleFrameworkList.faramTransform.outbound}
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
                                keySelector={ScaleFrameworkList.keySelector}
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
                                        faramAction={ScaleFrameworkList.addOptionClick}
                                        iconName={iconNames.add}
                                        transparent
                                    >
                                        {_ts('widgets.editor.scale', 'addOptionButtonLabel')}
                                    </PrimaryButton>
                                </header>
                                <SortableListView
                                    className={styles.editList}
                                    dragHandleClassName={styles.dragHandle}
                                    faramElement
                                    rendererParams={ScaleFrameworkList.rendererParams}
                                    itemClassName={styles.sortableUnit}
                                    renderer={InputRow}
                                />
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {_ts('widgets.editor.scale', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {_ts('widgets.editor.scale', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
