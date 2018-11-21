import PropTypes from 'prop-types';
import React from 'react';

import Faram, { requiredCondition } from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import ListView from '#rscv/List/ListView';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import Checkbox from '#rsci/Checkbox';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import NumberInput from '#rsci/NumberInput';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import { iconNames } from '#constants';

import { leadPaneTypeMap, LEAD_PANE_TYPE } from '#entities/lead';

import _ts from '#ts';
import _cs from '#cs';
import { RequestClient, requestMethods } from '#request';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mimeType: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,

    saveBookRequest: RequestClient.propType.isRequired,
    metaRequest: RequestClient.propType.isRequired,
};

const defaultProps = {
    className: '',
    mimeType: '',
};

const requests = {
    saveBookRequest: {
        method: ({ params: { body } }) => (body.id ? requestMethods.PUT : requestMethods.POST),
        url: ({ params: { body } }) => (body.id ? `/tabular-books/${body.id}/` : '/tabular-books/'),
        body: ({ params: { body } }) => body,
        onSuccess: ({ props, params: { callback, body }, response }) => {
            if (!body.id) {
                callback(response.id);
            } else {
                props.setTabularBook(response.id);
            }
        },
    },

    metaRequest: {
        method: requestMethods.GET,
        url: ({ params: { bookId } }) => `/tabular-books/${bookId}/`,
        query: { fields: 'meta_status,meta' },
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => (
                r.metaStatus === 'pending' ||
                r.metaStatus === 'initial'
            ),
        },
        onSuccess: ({ response, params: { setMeta, setInvalid } }) => {
            if (response.metaStatus === 'success') {
                setMeta(response.meta);
            } else {
                setInvalid();
            }
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
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static sheetKeySelector = d => d.key;

    static fileTypes = [
        { key: 'csv', label: 'CSV' },
        { key: 'xlsx', label: 'XLSX' },
    ];

    constructor(props) {
        super(props);
        this.state = {
            faramValues: {
                fileType: calcFileType(props.mimeType),
                options: {},
            },
            faramErrors: {},

            bookId: undefined,
            meta: undefined,
            invalid: false,
        };
        this.schema = {
            fields: {
                fileType: [requiredCondition],
                options: [],
            },
        };
    }

    setMeta = (meta) => {
        this.setState({ meta });
    }

    setInvalid = () => {
        this.setState({ invalid: true });
    }

    handleTabularBook = (bookId) => {
        this.setState({ bookId }, () => {
            this.props.metaRequest.do({
                bookId,
                setMeta: this.setMeta,
                setInvalid: this.setInvalid,
            });
        });
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
        const { bookId: id } = this.state;
        const { faramValues: { title, attachment: file, url } } = this.props.lead;
        this.props.saveBookRequest.do({
            body: { ...book, id, title, file: file && file.id, url },
            callback: this.handleTabularBook,
        });
    }

    renderCsvSettings = () => (
        <TextInput
            faramElementName="delimiter"
            label={_ts('addLeads.tabular', 'delimiterLabel')}
            placeholder="Default: ,"
            showLabel
            showHintAndError
        />
    )

    renderSheetSettings = ({ sheetId, title }) => (
        <FaramGroup faramElementName={sheetId}>
            <div className={styles.sheetSetting}>
                <header className={styles.header}>
                    <h4 className={styles.sheetTitle}>
                        {title}
                    </h4>
                    <Checkbox
                        className={styles.checkInput}
                        faramElementName="skip"
                        label={_ts('addLeads.tabular', 'skipLabel')}
                    />
                </header>
                <NumberInput
                    className={styles.sheetHeaderRowInput}
                    faramElementName="headerRow"
                    label={_ts('addLeads.tabular', 'headerRowLabel')}
                    placeholder="Default: 1"
                    showLabel
                    showHintAndError
                />
            </div>
        </FaramGroup>
    )

    renderSheetParams = (key, sheet) => ({
        sheetId: sheet.key,
        title: sheet.title,
    })

    renderExcelSettings = () => {
        const { meta: { sheets } = {} } = this.state;

        if (!sheets) {
            // FIXME: Error message or something
            return <div />;
        }

        return (
            <FaramGroup faramElementName="sheets">
                <ListView
                    className={styles.sheetList}
                    keySelector={LeadTabular.sheetKeySelector}
                    rendererParams={this.renderSheetParams}
                    renderer={this.renderSheetSettings}
                    data={sheets}
                />
            </FaramGroup>
        );
    }

    renderSettingsForFileType = (fileType) => {
        if (fileType === 'csv') {
            return this.renderCsvSettings();
        }

        if (fileType === 'xlsx') {
            return this.renderExcelSettings();
        }

        return <div />;
    }

    renderForm = (pending) => {
        const {
            faramValues,
            faramErrors,
            invalid,
            bookId,
        } = this.state;

        if (invalid) {
            return (
                <Message>
                    {_ts('addLeads.tabular', 'invalid')}
                </Message>
            );
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
                <SelectInput
                    className={styles.fileTypeSelect}
                    faramElementName="fileType"
                    label={_ts('addLeads.tabular', 'fileTypeLabel')}
                    options={LeadTabular.fileTypes}
                    showLabel
                    showHintAndError
                    hideClearButton
                    disabled={!!bookId}
                />
                {bookId && (
                    <FaramGroup faramElementName="options">
                        {this.renderSettingsForFileType(faramValues.fileType)}
                    </FaramGroup>
                )}
                <PrimaryButton
                    type="submit"
                    className={styles.submitButton}
                >
                    {!bookId && _ts('addLeads.tabular', 'nextLabel')}
                    {bookId && _ts('addLeads.tabular', 'extractLabel')}
                </PrimaryButton>
            </Faram>
        );
    }

    render() {
        const {
            className,
            onCancel,
            saveBookRequest,
            metaRequest,
        } = this.props;

        const pending = saveBookRequest.pending || metaRequest.pending;

        return (
            <div className={_cs(className, styles.leadTabular)}>
                {pending && (<LoadingAnimation />)}
                <div className={styles.header}>
                    <Button
                        className={styles.backButton}
                        iconName={iconNames.back}
                        onClick={onCancel}
                        transparent
                    />
                    <h4 className={styles.title}>
                        {_ts('addLeads.tabular', 'title')}
                    </h4>
                </div>
                <div className={styles.content}>
                    {this.renderForm(pending)}
                </div>
            </div>
        );
    }
}
