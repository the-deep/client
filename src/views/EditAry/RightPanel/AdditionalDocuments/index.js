import React from 'react';
import PropTypes from 'prop-types';
import { FaramGroup } from '@togglecorp/faram';

import LoadingAnimation from '#rscv/LoadingAnimation';

import MultiDocumentUploader from '#components/input/MultiDocumentUploader';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool,
    onUploadPending: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
    files: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
            onUpload,
            files,
        } = this.props;

        return (
            <div className={styles.additionalDocuments}>
                {pending && <LoadingAnimation />}
                <FaramGroup faramElementName="metadata">
                    <FaramGroup faramElementName="additionalDocuments">
                        <div className={styles.container}>
                            <MultiDocumentUploader
                                label={_ts('editAssessment.metadata', 'executiveSummaryTitle')}
                                className={styles.baksa}
                                faramElementName="executiveSummary"
                                // showPageRange
                                acceptFileTypes={acceptFileTypes}
                                onPending={this.handleExecutiveSummaryPending}
                                onUpload={onUpload}
                                files={files}
                            />
                            <MultiDocumentUploader
                                label={_ts('editAssessment.metadata', 'assessmentDatabaseTitle')}
                                className={styles.baksa}
                                faramElementName="assessmentData"
                                showUrlInput
                                acceptFileTypes={acceptFileTypes}
                                onPending={this.handleAssessmentDataPending}
                                onUpload={onUpload}
                                files={files}
                            />
                            <MultiDocumentUploader
                                label={_ts('editAssessment.metadata', 'questionnaireTitle')}
                                className={styles.baksa}
                                faramElementName="questionnaire"
                                // showPageRange
                                acceptFileTypes={acceptFileTypes}
                                onPending={this.handleQuestionnairePending}
                                onUpload={onUpload}
                                files={files}
                            />
                            <MultiDocumentUploader
                                label={_ts('editAssessment.metadata', 'miscTitle')}
                                className={styles.baksa}
                                faramElementName="misc"
                                onPending={this.handleMiscPending}
                                onUpload={onUpload}
                                files={files}
                            />
                        </div>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
