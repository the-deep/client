import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import LoadingAnimation from '#rscv/LoadingAnimation';

import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { iconNames } from '#constants';

import _ts from '#ts';
import _cs from '#cs';
import { RequestClient, requestMethods } from '#request';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,
    createTabularBook: RequestClient.prop.isRequired,
};

const defaultProps = {
    className: '',
};

const requests = {
    createTabularBook: {
        method: requestMethods.POST,
        url: '/tabular-books/',
        body: ({ params }) => params,
        onSuccess: ({ props, response }) => {
            props.setTabularBook(response.id);
        },
    },
};

@RequestClient(requests)
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static FILE_TYPES = [
        { key: 'csv', label: 'CSV' },
        { key: 'xlsx', label: 'XLSX' },
    ];

    constructor(props) {
        super(props);
        this.state = {
            faramValues: { options: { delimiter: ',' } },
            faramErrors: {},
        };
        this.schema = {
            fields: {
                fileType: [requiredCondition],
                options: [],
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

    handleFaramValidationSuccess = (book) => {
        const { faramValues: { title, attachment: file, url } } = this.props.lead;
        this.props.createTabularBook.do({ ...book, title, file, url });
    }

    renderCsvSettings = () => (
        <TextInput
            faramElementName="delimiter"
            label={_ts('addLeads', 'tabularDelimiterLabel')}
            options={LeadTabular.FILE_TYPES}
            showLabel
            showHintAndError
        />
    )

    renderSettingsForFileType = (fileType) => {
        if (fileType === 'csv') {
            return this.renderCsvSettings();
        }
        return <div />;
    }

    render() {
        const {
            className,
            onCancel,
            createTabularBook,
        } = this.props;
        const {
            faramValues,
            faramErrors,
        } = this.state;

        const pending = !!(createTabularBook.pending || createTabularBook.response);

        return (
            <Faram
                className={_cs(styles.tabularForm, className)}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                {pending && (<LoadingAnimation />)}
                <div className={styles.header}>
                    <Button
                        iconName={iconNames.prev}
                        onClick={onCancel}
                        transparent
                    />
                    <h4>
                        Extract Tabular Data from Lead
                    </h4>
                </div>
                <div className={styles.body}>
                    <SelectInput
                        faramElementName="fileType"
                        label={_ts('addLeads', 'tabularFileTypeLabel')}
                        options={LeadTabular.FILE_TYPES}
                        showLabel
                        showHintAndError
                    />
                    <FaramGroup faramElementName="options">
                        {this.renderSettingsForFileType(faramValues.fileType)}
                    </FaramGroup>
                    <PrimaryButton type="submit">
                        {_ts('addLeads', 'tabularExtractLabel')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
