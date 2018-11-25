import PropTypes from 'prop-types';
import React from 'react';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';

import _ts from '#ts';

import CsvSettings from './CsvSettings';
import ExcelSettings from './ExcelSettings';
import styles from './styles.scss';

const propTypes = {
    onPrev: PropTypes.func,
    fileType: PropTypes.string.isRequired,
    pending: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    onPrev: () => {},
};

export default class AttributesPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            faramValues: {},
            faramErrors: {},
            meta: undefined,
        };

        // schema depends on filetype
        this.schema = {};
    }

    handleBackClick = () => {
        this.props.onPrev();
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
        console.warn(faramValues);
    }

    render() {
        const {
            faramValues,
            faramErrors,
            meta,
        } = this.state;
        const {
            fileType,
            pending,
        } = this.props;

        let component = null;
        if (fileType === 'csv') {
            component = <CsvSettings />;
        } else if (fileType === 'xlsx') {
            component = <ExcelSettings meta={meta} />;
        }

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
                <FaramGroup faramElementName="options">
                    {component}
                </FaramGroup>
                <PrimaryButton
                    className={styles.submitButton}
                    onClick={this.handleBackClick}
                >
                    {_ts('addLeads.tabular', 'backLabel')}
                </PrimaryButton>
                <PrimaryButton
                    type="submit"
                    className={styles.submitButton}
                >
                    {_ts('addLeads.tabular', 'extractLabel')}
                </PrimaryButton>
            </Faram>
        );
    }
}
