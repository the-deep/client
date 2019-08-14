import React from 'react';
import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import LoadingAnimation from '#rscv/LoadingAnimation';

import _ts from '#ts';

import MultiDocumentUploader from '#components/input/MultiDocumentUploader';

import Header from '../Header';

import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool,
    onUploadPending: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: false,
};

const acceptFileTypes = '.pdf, .ppt, .pptx, .csv, .xls, .xlsx, .ods, .doc, .docx, .odt, .rtf';

export default class AdditionalDocuments extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleExecutiveSummaryPending = (value) => {
        this.props.onUploadPending('executiveSummary', value);
    }

    handleQuestionnairePending = (value) => {
        this.props.onUploadPending('questionnaire', value);
    }

    handleMiscPending = (value) => {
        this.props.onUploadPending('misc', value);
    }

    handleAssessmentDataPending = (value) => {
        this.props.onUploadPending('assessmentData', value);
    }

    render() {
        const {
            pending,
        } = this.props;

        return (
            <div className={styles.additionalDocuments}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="metadata">
                    <FaramGroup faramElementName="additionalDocuments">
                        <div className={styles.container}>
                            <div className={styles.content}>
                                <MultiDocumentUploader
                                    label={_ts('editAssessment.metadata', 'executiveSummaryTitle')}
                                    className={styles.baksa}
                                    faramElementName="executiveSummary"
                                    showPageRange
                                    acceptFileTypes={acceptFileTypes}
                                    onPending={this.handleExecutiveSummaryPending}
                                />
                                <MultiDocumentUploader
                                    label={_ts('editAssessment.metadata', 'assessmentDatabaseTitle')}
                                    className={styles.baksa}
                                    faramElementName="assessmentData"
                                    showUrlInput
                                    acceptFileTypes={acceptFileTypes}
                                    onPending={this.handleAssessmentDataPending}
                                />
                                <MultiDocumentUploader
                                    label={_ts('editAssessment.metadata', 'questionnaireTitle')}
                                    className={styles.baksa}
                                    faramElementName="questionnaire"
                                    showPageRange
                                    acceptFileTypes={acceptFileTypes}
                                    onPending={this.handleQuestionnairePending}
                                />
                                <MultiDocumentUploader
                                    label={_ts('editAssessment.metadata', 'miscTitle')}
                                    className={styles.baksa}
                                    faramElementName="misc"
                                    onPending={this.handleMiscPending}
                                />
                            </div>
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
