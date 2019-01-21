import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Faram, { requiredCondition } from '#rscg/Faram';

import Modal from '#rscv/Modal';
import ScrollTabs from '#rscv/ScrollTabs';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { mapToMap } from '#rsu/common';
import { DATA_TYPE } from '#entities/tabular';
import _ts from '#ts';

import SheetSettings from './SheetSettings';
import styles from './styles.scss';

const propTypes = {
    initialValue: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


export default class EditFieldModal extends React.PureComponent {
    static propTypes = propTypes;

    static fieldKeySelector = d => d.id;

    constructor(props) {
        super(props);
        const { initialValue } = props;

        const keys = Object.keys(initialValue);
        const activeSheet = keys[0];

        this.state = {
            activeSheet,
            faramValues: initialValue,
            faramErrors: {},
            pristine: true,
            hasError: false,
        };

        this.schema = this.calcSchema(keys);
    }

    calcSchema = (sheetKeys = []) => {
        const commonFields = {
            id: [requiredCondition],
            title: [requiredCondition],
            type: [requiredCondition],
            ordering: [requiredCondition],
            hidden: [requiredCondition],
        };
        return {
            fields: sheetKeys.reduce(
                (acc, sheetKey) => ({
                    ...acc,
                    [sheetKey]: {
                        fields: {
                            id: [requiredCondition],
                            title: [requiredCondition],
                            hidden: [],
                            fields: { // the name of the actual field is "fields"
                                identifier: (value = {}) => value.type,
                                keySelector: EditFieldModal.fieldKeySelector,
                                member: {
                                    default: {
                                        fields: commonFields,
                                    },
                                    [DATA_TYPE.string]: {
                                        fields: commonFields,
                                    },
                                    [DATA_TYPE.number]: {
                                        fields: {
                                            ...commonFields,
                                            options: {
                                                fields: {
                                                    separator: [requiredCondition],
                                                },
                                            },
                                        },
                                    },
                                    [DATA_TYPE.geo]: {
                                        fields: {
                                            ...commonFields,
                                            options: {
                                                fields: {
                                                    geoType: [requiredCondition],
                                                    adminLevel: [requiredCondition],
                                                },
                                            },
                                        },
                                    },
                                    [DATA_TYPE.datetime]: {
                                        fields: {
                                            ...commonFields,
                                            options: {
                                                fields: {
                                                    dateFormat: [requiredCondition],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                {},
            ),
        };
    }

    calcSheetTitles = memoize((sheetsMap) => {
        const sheets = mapToMap(
            sheetsMap,
            k => k,
            sheet => sheet.title,
        );
        return sheets;
    });

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
            hasError: faramInfo.hasError,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors, hasError: true });
    }

    handleFaramValidationSuccess = (value) => {
        this.props.onChange(value);
    }

    handleSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    render() {
        const {
            faramValues,
            faramErrors,
            activeSheet,
            pristine,
            hasError,
        } = this.state;

        const sheetTitles = this.calcSheetTitles(faramValues);

        // TODO: use errorIndicator for tabs (sheets) and vertical tabs (columns)

        return (
            <Modal className={styles.editFieldModal}>
                <ModalHeader title={_ts('tabular.editModal.editField', 'title')} />
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ModalBody className={styles.editFieldModalBody}>
                        <ScrollTabs
                            className={styles.tabs}
                            tabs={sheetTitles}
                            active={activeSheet}
                            onClick={this.handleSheetChange}
                        />
                        { activeSheet &&
                            <SheetSettings
                                className={styles.sheet}
                                sheetId={activeSheet}
                                details={faramValues[activeSheet]}
                            />
                        }
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton onClick={this.props.onCancel}>
                            {_ts('tabular.editModal.editField', 'cancelLabel')}
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                            disabled={pristine || hasError}
                        >
                            {_ts('tabular.editModal.editField', 'submitLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
