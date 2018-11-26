import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import NonFieldErrors from '#rsci/NonFieldErrors';
import SegmentInput from '#rsci/SegmentInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import { leadPaneTypeMap, LEAD_PANE_TYPE } from '#entities/lead';
import { RequestClient, requestMethods } from '#request';
import _ts from '#ts';

import styles from './styles.scss';

const noOp = () => {};

const propTypes = {
    onComplete: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    onNext: PropTypes.func, // eslint-disable-line react/no-unused-prop-types

    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    mimeType: PropTypes.string,

    createBookRequest: RequestClient.prop.isRequired,
};

const defaultProps = {
    onComplete: noOp,
    onNext: noOp,
    mimeType: '',
};

const requests = {
    createBookRequest: {
        method: requestMethods.POST,
        url: '/tabular-books/',
        body: ({ params: { body } }) => body,
        onSuccess: ({ props, response }) => {
            props.onComplete(response.id, response.fileType, props.onNext);
        },
        onFailure: ({ error: { faramErrors }, params: { handleFaramError } }) => {
            handleFaramError(faramErrors);
        },
        onFatal: ({ params: { handleFaramError } }) => {
            handleFaramError({
                $internal: ['SERVER ERROR'],
            });
        },
    },
};

const calcFileType = (mimeType) => {
    const leadType = leadPaneTypeMap[mimeType];
    if (leadType === LEAD_PANE_TYPE.spreadsheet) {
        return 'xlsx';
    }
    return 'csv';
};

@RequestClient(requests)
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
                fileType: calcFileType(props.mimeType),
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
        console.warn(faramErrors);
        this.setState({ faramErrors });
    }

    handleFaramValidationSuccess = (faramValues) => {
        const { lead } = this.props;
        const { faramValues: { title, attachment: file, url } } = lead;
        this.props.createBookRequest.do({
            body: {
                ...faramValues,
                title,
                url,
                file: file && file.id,
            },
            handleFaramError: this.handleFaramValidationFailure,
        });
    }

    render() {
        const {
            faramValues,
            faramErrors,
        } = this.state;
        const { createBookRequest } = this.props;

        // TODO: Handle error
        const { pending } = createBookRequest;

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
                <NonFieldErrors faramElement />
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
                    pending={pending}
                >
                    {_ts('addLeads.tabular', 'nextLabel')}
                </PrimaryButton>
            </Faram>
        );
    }
}
