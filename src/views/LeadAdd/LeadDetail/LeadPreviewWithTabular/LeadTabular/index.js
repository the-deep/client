import PropTypes from 'prop-types';
import React from 'react';
import { listToMap } from '@togglecorp/fujs';
import Faram, {
    FaramGroup,
    requiredCondition,
    greaterThanCondition,
} from '@togglecorp/faram';

import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Button from '#rsca/Button';
import NonFieldErrors from '#rsci/NonFieldErrors';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';

import _ts from '#ts';
import _cs from '#cs';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import CsvSettings from './CsvSettings';
import ExcelSettings from './ExcelSettings';
import styles from './styles.scss';

const spreadsheetTypes = ['ods', 'xlsx', 'xls'];

const createFaramValues = (faramValues, meta, fileType) => {
    if (fileType === 'csv') {
        return {
            ...faramValues,
            options: {
                delimiter: ',',
            },
        };
    } else if (spreadsheetTypes.includes(fileType)) {
        const { sheets = [] } = meta;
        return {
            ...faramValues,
            options: {
                sheets: listToMap(
                    sheets,
                    sheet => sheet.key,
                    () => ({
                        headerRow: 1,
                    }),
                ),
            },
        };
    }
    return faramValues;
};

const createSchema = (meta, fileType) => {
    if (fileType === 'csv') {
        return {
            fields: {
                options: {
                    fields: {
                        delimiter: [requiredCondition],
                        noHeaders: [],
                    },
                },
                fileType: [],
                title: [],
                file: [],
                project: [],
            },
        };
    } else if (spreadsheetTypes.includes(fileType)) {
        const { sheets = [] } = meta;

        const xlsxSchema = listToMap(
            sheets,
            sheet => sheet.key,
            () => ({
                identifier: (val = {}) => (val.skip ? 'skipped' : 'default'),
                fields: {
                    skipped: {
                        skip: [],
                    },
                    default: {
                        skip: [],
                        headerRow: [requiredCondition, greaterThanCondition(0)],
                        noHeaders: [],
                    },
                },
            }),
        );

        return {
            validation: (value = {}) => {
                const errors = [];
                const {
                    options: {
                        sheets: sheetsValue = {},
                    } = {},
                } = value;
                const hasAllSkipped = Object.keys(sheetsValue)
                    .every(key => sheetsValue[key].skip);
                if (hasAllSkipped) {
                    errors.push('All sheets cannot be skipped');
                }
                return errors;
            },
            fields: {
                options: {
                    fields: {
                        sheets: {
                            fields: xlsxSchema,
                        },
                    },
                },
                title: [],
                fileType: [],
                file: [],
                project: [],
            },
        };
    }
    return {};
};


// fileId: attachment.id
// fileType: get from mimetype
const requestOptions = {
    getMetaInfoRequest: {
        method: methods.GET,
        onMount: true,
        url: ({ params: { fileId, fileType } }) => (
            `/meta-extraction/${fileId}/?file_type=${fileType}`
        ),
        onSuccess: ({ params: { fileType, faramValues, setState }, response: meta }) => {
            const newFaramValues = createFaramValues(faramValues, meta, fileType);
            const newSchema = createSchema(meta, fileType);
            setState({
                faramValues: newFaramValues,
                schema: newSchema,
                meta,
            });
        },
    },
    createBookRequest: {
        method: methods.POST,
        url: '/tabular-books/',
        body: ({ params: { body } }) => body,
        onSuccess: ({ params, response }) => {
            params.onComplete(response.id);
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

const propTypes = {
    className: PropTypes.string,
    fileType: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setTabularBook: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    onCancel: PropTypes.func.isRequired,
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    fileType: '',
};


@RequestCoordinator
@RequestClient(requestOptions)
export default class LeadTabular extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            lead: { faramValues },
            requests: {
                getMetaInfoRequest,
            },
            fileType,
        } = this.props;

        const {
            title,
            project,
            attachment,
        } = faramValues;

        const newFaramValues = {
            title,
            project,
            file: attachment.id,
            fileType,
        };

        getMetaInfoRequest.setDefaultParams({
            fileId: attachment.id,
            fileType,
            faramValues: newFaramValues,
            setState: val => this.setState(val),
        });

        this.state = {
            fileType,
            schema: {},
            faramValues: newFaramValues,
            faramErrors: {},
            hasError: false,
        };
    }

    handleComplete = (bookId) => {
        const { setTabularBook } = this.props;
        setTabularBook(bookId);
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        this.setState({
            faramValues,
            faramErrors,
            hasError: faramInfo.hasError,
        });
    }

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors, hasError: true });
    }

    handleFaramValidationSuccess = (faramValues) => {
        const {
            requests: {
                createBookRequest,
            },
        } = this.props;
        createBookRequest.do({
            body: faramValues,
            handleFaramError: this.handleFaramValidationFailure,
            onComplete: this.handleComplete,
        });
    }

    renderBody = () => {
        const {
            lead: {
                faramValues: {
                    title,
                } = {},
            },
            onCancel,
            requests: {
                getMetaInfoRequest,
                createBookRequest,
            },
        } = this.props;
        const {
            fileType,
            schema,
            faramValues,
            faramErrors,
            hasError,
            meta,
        } = this.state;

        const {
            pending,
            responseError,
        } = getMetaInfoRequest;

        const noForm = pending || !!responseError;

        const { pending: savePending } = createBookRequest;

        // NOTE: Default component should be null but FaramGroup doesn't
        // support null child yet.
        const component = (
            (fileType === 'csv' && !noForm && <CsvSettings className={styles.csv} />) ||
            (spreadsheetTypes.includes(fileType) && !noForm &&
                <ExcelSettings
                    meta={meta}
                    sheets={faramValues.options.sheets}
                    disabled={savePending}
                />
            )
        );

        return (
            <Faram
                className={styles.form}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={savePending || noForm}
            >
                <ModalHeader
                    className={styles.header}
                    title={_ts('addLeads.tabular', 'title', { title })}
                />
                <ModalBody className={styles.body} >
                    { pending &&
                        <LoadingAnimation
                            message={_ts('addLeads.tabular', 'tabularExtractionLoading')}
                        />
                    }
                    {
                        responseError &&
                        <Message>
                            {_ts('addLeads.tabular', 'tabularExtractionError')}
                        </Message>
                    }
                    {
                        !noForm &&
                            <div className={styles.options} >
                                <NonFieldErrors faramElement />
                                { component &&
                                    <FaramGroup faramElementName="options">
                                        {component}
                                    </FaramGroup>
                                }
                            </div>
                    }
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onCancel}>
                        {_ts('addLeads.tabular', 'cancelButtonTitle')}
                    </Button>
                    <PrimaryButton
                        type="submit"
                        pending={savePending}
                        disabled={hasError || noForm}
                    >
                        {_ts('addLeads.tabular', 'extractButtonTitle')}
                    </PrimaryButton>
                </ModalFooter>
            </Faram>
        );
    }

    render() {
        const { className } = this.props;
        const Body = this.renderBody;

        return (
            <div
                className={_cs(
                    className,
                    styles.leadTabular,
                )}
            >
                <Body />
            </div>
        );
    }
}
