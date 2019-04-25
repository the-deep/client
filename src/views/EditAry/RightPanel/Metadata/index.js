import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FaramGroup } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';
import ResizableV from '#rscv/Resizable/ResizableV';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import modalize from '#rscg/Modalize';

import {
    aryTemplateMetadataSelector,
    assessmentSourcesSelector,
} from '#redux';
import _ts from '#ts';

import MultiDocumentUploader from '#components/input/MultiDocumentUploader';

import { renderWidget } from '../widgetUtils';
import Header from '../Header';

import StakeholderModal from './StakeholderModal';

import styles from './styles.scss';

const propTypes = {
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool.isRequired,
    sources: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    aryTemplateMetadata: [],
};

const mapStateToProps = state => ({
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    sources: assessmentSourcesSelector(state),
});

const acceptFileTypes = '.pdf, .ppt, .pptx, .csv, .xls, .xlsx, .ods, .doc, .docx, .odt, .rtf';

const StakeholderButton = props => (
    <AccentButton
        iconName="people"
        transparent
        {...props}
    />
);
const ModalButton = modalize(StakeholderButton);

@connect(mapStateToProps)
export default class Metadata extends React.PureComponent {
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

    renderWidget = (k, data) => renderWidget(k, data, this.props.sources);

    renderReadonlyWidget = (k, data) => renderWidget(
        k,
        data,
        this.props.sources, { readonly: true },
    );

    renderMetadata = (k, data) => {
        const {
            fields,
            id,
            title,
        } = data;

        const isStakeholderColumn = title === 'Stakeholders';

        const fieldValues = Object.values(fields);
        return (
            <div
                key={id}
                className={styles.widgetGroup}
            >
                <h4 className={styles.heading}>
                    {title}
                    {isStakeholderColumn &&
                        <ModalButton
                            initialShowModal
                            className={styles.showMoreButton}
                            modal={
                                <StakeholderModal
                                    fields={fieldValues}
                                    sources={this.props.sources}
                                />
                            }
                        />
                    }
                </h4>
                <ListView
                    className={styles.content}
                    data={fieldValues}
                    modifier={
                        isStakeholderColumn
                            ? this.renderReadonlyWidget
                            : this.renderWidget
                    }
                />
            </div>
        );
    }

    render() {
        const {
            aryTemplateMetadata: metadataGroups,
            pending,
        } = this.props;

        // const basicInformationTitle = _ts('editAssessment.metadata', 'basicInformationTitle');
        const additionalDocumentsTitle = _ts('editAssessment.metadata', 'additionalDocumentsTitle');

        const metadataGroupValues = Object.values(metadataGroups);

        return (
            <div className={styles.metadata}>
                <FaramGroup faramElementName="metadata">
                    {pending && <LoadingAnimation />}
                    <ResizableV
                        className={styles.resizable}
                        topContainerClassName={styles.top}
                        bottomContainerClassName={styles.bottom}
                        topChild={
                            <FaramGroup faramElementName="basicInformation">
                                <div className={styles.basicInformation}>
                                    <Header className={styles.header} />
                                    <ListView
                                        className={styles.content}
                                        data={metadataGroupValues}
                                        modifier={this.renderMetadata}
                                    />
                                </div>
                            </FaramGroup>
                        }
                        bottomChild={
                            <FaramGroup faramElementName="additionalDocuments">
                                <div className={styles.additionalDocuments}>
                                    <Header
                                        title={additionalDocumentsTitle}
                                        className={styles.header}
                                    />
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
                        }
                    />
                </FaramGroup>
            </div>
        );
    }
}
