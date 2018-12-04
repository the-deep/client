import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '#rscv/LoadingAnimation';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import Faram from '#rscg/Faram';
import FaramGroup from '#rscg/FaramGroup';
import NonFieldErrors from '#rsci/NonFieldErrors';

import TriggerAndPoll from '#components/TriggerAndPoll';
import { RequestClient, requestMethods } from '#request';

import _ts from '#ts';

import CsvSettings, { csvSchema } from './CsvSettings';
import ExcelSettings, { xlsxSchema } from './ExcelSettings';
import styles from './styles.scss';

const propTypes = {
    bookId: PropTypes.number,
    onPrev: PropTypes.func,
    defaultFileType: PropTypes.string,
    saveBookRequest: RequestClient.prop.isRequired,
};

const defaultProps = {
    bookId: undefined,
    onPrev: () => {},
    defaultFileType: undefined,
};

const createMetaRequestUrl = bookId => `/tabular-books/${bookId}/`;
const metaRequestQuery = { fields: 'file_type,meta_status,meta' };
const shouldPollMetaRequest = r => (
    r.metaStatus === 'pending' ||
    r.metaStatus === 'initial'
);

const schemaPerFileType = {
    csv: {
        fields: {
            options: csvSchema,
        },
    },
    xlsx: {
        fields: {
            options: xlsxSchema,
        },
    },
};

const requests = {
    saveBookRequest: {
        method: requestMethods.PATCH,
        url: ({ params: { bookId } }) => `/tabular-books/${bookId}/`,
        body: ({ params: { body } }) => body,
        onSuccess: ({ props }) => {
            props.onComplete();
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

@RequestClient(requests)
export default class AttributesPage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            faramValues: {},
            faramErrors: {},
        };
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
        const { bookId } = this.props;
        this.props.saveBookRequest.do({
            body: faramValues,
            bookId,
            handleFaramError: this.handleFaramValidationFailure,
        });
    }

    renderFaram = ({ pollRequest }) => {
        const {
            faramValues,
            faramErrors,
        } = this.state;
        const { defaultFileType } = this.props;
        const { saveBookRequest } = this.props;

        // TODO: Handle pollRequest.error and saveRequest.error
        const { pending: pollPending, response } = pollRequest;
        const { pending: savePending } = saveBookRequest;

        // Default component should be null but FaramGroup doesn't
        // support null child yet.
        let component = <div />;
        let currentFileType = defaultFileType;

        if (response) {
            const { meta, fileType } = response;
            currentFileType = fileType;

            if (fileType === 'csv') {
                component = <CsvSettings />;
            } else if (fileType === 'xlsx') {
                component = <ExcelSettings meta={meta} />;
            }
        }

        return (
            <Faram
                className={styles.form}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                schema={schemaPerFileType[currentFileType]}
                value={faramValues}
                error={faramErrors}
                disabled={pollPending || savePending}
            >
                {pollPending && <LoadingAnimation />}
                <NonFieldErrors faramElement />
                <FaramGroup faramElementName="options">
                    {component}
                </FaramGroup>
                <div>
                    <Button
                        className={styles.submitButton}
                        onClick={this.handleBackClick}
                        disabled={pollPending || savePending}
                    >
                        {_ts('addLeads.tabular', 'backLabel')}
                    </Button>
                    <PrimaryButton
                        type="submit"
                        className={styles.submitButton}
                        pending={savePending}
                    >
                        {_ts('addLeads.tabular', 'extractLabel')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }

    render() {
        const { bookId } = this.props;
        if (!bookId) {
            return null;
        }

        const FaramChild = this.renderFaram;

        return (
            <TriggerAndPoll
                pollUrl={createMetaRequestUrl(bookId)}
                query={metaRequestQuery}
                shouldPoll={shouldPollMetaRequest}
                pollOnly
            >
                <FaramChild />
            </TriggerAndPoll>
        );
    }
}
