import PropTypes from 'prop-types';
import React from 'react';

import Faram, {
    requiredCondition,
} from '#rs/components/Input/Faram';
import FaramList from '#rs/components/Input/Faram/FaramList';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import List from '#rs/components/View/List';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import TextInput from '#rs/components/Input/TextInput';
import Modal from '#rs/components/View/Modal';
import ModalBody from '#rs/components/View/Modal/Body';
import ModalFooter from '#rs/components/View/Modal/Footer';
import ModalHeader from '#rs/components/View/Modal/Header';
import { randomString, unique } from '#rs/utils/common';

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
                        errors.push(_ts('framework.scaleWidget', 'requiredErrorMessage'));
                    } else if (
                        scaleUnits && unique(scaleUnits, o => o.label).length !== scaleUnits.length
                    ) {
                        errors.push(_ts('framework.scaleWidget', 'duplicateErrorMessage'));
                    }
                    return errors;
                },
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
        newElement: () => ({
            key: randomString(16).toLowerCase(),
            label: '',
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

    handleFaramValidationSuccess = (faramValues) => {
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
                        <div className={styles.titleInputContainer} >
                            <TextInput
                                faramElementName="title"
                                label={_ts('framework.scaleWidget', 'titleLabel')}
                                placeholder={_ts('framework.scaleWidget', 'titlePlaceholderScale')}
                                showHintAndError={false}
                                autoFocus
                                selectOnFocus
                            />
                        </div>
                        <div className={styles.scaleUnits}>
                            <FaramList faramElementName="scaleUnits">
                                <NonFieldErrors faramElement />
                                <header className={styles.header}>
                                    <h4>
                                        {_ts('framework.scaleWidget', 'addOptionHeadingLabel')}
                                    </h4>
                                    <PrimaryButton
                                        faramAction="add"
                                        faramInfo={ScaleFrameworkList.faramInfoForAdd}
                                        iconName={iconNames.add}
                                        transparent
                                    >
                                        {_ts('framework.scaleWidget', 'addOptionButtonLabel')}
                                    </PrimaryButton>
                                </header>
                                <div className={styles.editScaleUnitList}>
                                    <List
                                        faramElement
                                        keyExtractor={ScaleFrameworkList.keyExtractor}
                                        rendererParams={ScaleFrameworkList.rendererParams}
                                        renderer={InputRow}
                                    />
                                </div>
                            </FaramList>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={onClose}>
                            {_ts('framework.scaleWidget', 'cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={!pristine}
                        >
                            {_ts('framework.scaleWidget', 'saveButtonLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
