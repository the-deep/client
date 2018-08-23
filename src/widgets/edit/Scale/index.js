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

const emptyList = [];

export default class ScaleFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = scaleUnit => scaleUnit.key;

    static rendererParams = (key, elem, i) => ({
        index: i,
    })

    static schema = {
        fields: {
            title: [requiredCondition],
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
                keySelector: ScaleFrameworkList.keyExtractor,
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

    static faramInfoForAdd = {
        action: 'add',
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            title: '',
        }),
    }

    constructor(props) {
        super(props);

        const {
            title,
            data: {
                scaleUnits = emptyList,
                value: defaultScaleUnit,
            },
        } = props;

        this.state = {
            // TODO: Implement defaultScaleUnit
            defaultScaleUnit,
            faramValues: {
                title,
                scaleUnits,
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
                            showHintAndError={false}
                            autoFocus
                            selectOnFocus
                        />
                        <div className={styles.scaleUnits}>
                            <FaramList
                                faramElementName="scaleUnits"
                                keySelector={ScaleFrameworkList.keyExtractor}
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
                                        faramInfo={ScaleFrameworkList.faramInfoForAdd}
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
