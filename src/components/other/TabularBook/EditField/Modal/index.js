import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import Faram, { requiredCondition } from '#rscg/Faram';

import Modal from '#rscv/Modal';
import ScrollTabs from '#rscv/ScrollTabs';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';

import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { mapToMap } from '#rsu/common';
import _ts from '#ts';

import SheetSettings from './SheetSettings';

const propTypes = {
    initialValue: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


export default class EditFieldModal extends React.PureComponent {
    static propTypes = propTypes;
    static fieldKeySelector = d => d.id;

    constructor(props) {
        super(props);
        const { initialValue } = props;
        const activeSheet = Object.keys(initialValue)[0];

        this.state = {
            faramValues: initialValue,
            faramErrors: {},
            activeSheet,
        };


        this.schema = this.calcSchema(initialValue);
        console.warn(this.schema);
    }

    calcSchema = (faramValues) => {
        const fields = {};

        Object.keys(faramValues).forEach((key) => {
            fields[key] = {
                fields: {
                    fields: {
                        keySelector: EditFieldModal.fieldKeySelector,
                        member: {
                            fields: {
                                hidden: [],
                                id: [requiredCondition],
                                options: [],
                                ordering: [requiredCondition],
                                title: [requiredCondition],
                                type: [requiredCondition],
                            },
                        },
                    },
                    hidden: [],
                    title: [requiredCondition],
                    id: [requiredCondition],
                },
            };
        });

        return ({ fields });
    }

    calcSheetTitles = memoize((sheetsMap) => {
        const sheets = mapToMap(
            sheetsMap,
            k => k,
            sheet => sheet.title,
        );
        return sheets;
    });

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (value) => {
        console.warn(value);
        // this.props.onChange(value);
    }

    handleSheetChange = (activeSheet) => {
        this.setState({ activeSheet });
    }

    render() {
        const {
            faramValues,
            faramErrors,
            activeSheet,
        } = this.state;

        const sheetTitles = this.calcSheetTitles(faramValues);

        return (
            <Modal>
                <ModalHeader title={_ts('tabular.editField', 'title')} />
                <Faram
                    onChange={this.handleFaramChange}
                    onValidationFailure={this.handleFaramValidationFailure}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                >
                    <ScrollTabs
                        tabs={sheetTitles}
                        active={activeSheet}
                        onClick={this.handleSheetChange}
                    />
                    {activeSheet &&
                        <SheetSettings
                            sheetId={activeSheet}
                            details={faramValues[activeSheet]}
                        />
                    }
                    <ModalFooter>
                        <DangerButton onClick={this.props.onCancel}>
                            {_ts('tabular.editField', 'cancelLabel')}
                        </DangerButton>
                        <PrimaryButton type="submit">
                            {_ts('tabular.editField', 'submitLabel')}
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}
