import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import SegmentInput from '#rsci/SegmentInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    fileType: PropTypes.string.isRequired,
    onNext: PropTypes.func,
    setFileType: PropTypes.func.isRequired,
    pending: PropTypes.bool,
};

const defaultProps = {
    fileType: undefined,
    pending: false,
    onNext: () => {},
};

export default class FileTypeSelectionPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static fileTypes = [
        { key: 'csv', label: 'CSV' },
        { key: 'xlsx', label: 'XLSX' },
    ];

    constructor(props) {
        super(props);
        this.state = {
            faramValues: {
                fileType: props.fileType,
            },
            faramErrors: {},
        };
        this.schema = {
            fields: {
                fileType: [requiredCondition],
            },
        };
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (faramValues) => {
        this.props.setFileType(faramValues.fileType);
        this.props.onNext();
    }

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;
        const { pending } = this.props;

        return (
            <Faram
                className={styles.form}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                <SegmentInput
                    name="file-type-selection"
                    className={styles.fileTypeSelect}
                    faramElementName="fileType"
                    label={_ts('addLeads.tabular', 'fileTypeLabel')}
                    options={FileTypeSelectionPage.fileTypes}
                    showLabel
                    showHintAndError
                    hideClearButton
                />
                <PrimaryButton
                    type="submit"
                    className={styles.submitButton}
                >
                    {_ts('addLeads.tabular', 'nextLabel')}
                </PrimaryButton>
            </Faram>
        );
    }
}
