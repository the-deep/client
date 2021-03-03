import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Faram, { analyzeErrors } from '@togglecorp/faram';
import memoize from 'memoize-one';

import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,

    assessmentSchemaSelector,
    assessmentComputeSchemaSelector,
    editAryIsPristineSelector,

    changeAryForEditAryAction,
    setFilesForEditAryAction,

    editAryFilesSelecotr,
    editAryFaramValuesSelector,
    editAryFaramErrorsSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,
} from '#redux';
import _ts from '#ts';


import { NormalTabTitle } from '#components/general/TabTitle';

import AdditionalDocuments from './AdditionalDocuments';
import CNA from './CNA';
import Focuses from './Focuses';
import HNO from './HNO';
import Metadata from './Metadata';
import Methodology from './Methodology';
import Score from './Score';
import Summary from './Summary';

import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number,
    activeLeadGroupId: PropTypes.number,
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryFaramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    changeAry: PropTypes.func.isRequired,
    onActiveSectorChange: PropTypes.func,
    pending: PropTypes.bool,
    readOnly: PropTypes.bool,
    editAryIsPristine: PropTypes.bool.isRequired,

    showHNO: PropTypes.bool,
    showCNA: PropTypes.bool,
};

const defaultProps = {
    schema: {},
    pending: false,
    computeSchema: {},
    editAryFaramErrors: {},
    editAryFaramValues: {},
    onActiveSectorChange: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
    readOnly: false,

    showHNO: false,
    showCNA: false,
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),

    files: editAryFilesSelecotr(state),

    editAryFaramValues: editAryFaramValuesSelector(state),
    editAryFaramErrors: editAryFaramErrorsSelector(state),

    schema: assessmentSchemaSelector(state),
    computeSchema: assessmentComputeSchemaSelector(state),

    showHNO: editAryShouldShowHNO(state),
    showCNA: editAryShouldShowCNA(state),
});

const mapDispatchToProps = dispatch => ({
    changeAry: params => dispatch(changeAryForEditAryAction(params)),
    setFiles: params => dispatch(setFilesForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.tabs = {
            metadata: _ts('editAssessment', 'metadataTabLabel'),
            additionalDocuments: _ts('editAssessment', 'additionalDocumentsTabLabel'),
            focuses: _ts('editAssessment', 'focusesTabLabel'),
            methodology: _ts('editAssessment', 'methodologyTabLabel'),
            summary: _ts('editAssessment', 'summaryTabLabel'),
            score: _ts('editAssessment', 'scoreTabLabel'),
        };

        this.defaultHash = 'metadata';

        this.views = {
            metadata: {
                rendererParams: () => ({
                    className: styles.metadata,
                    pending: this.props.pending,
                }),
                component: Metadata,
            },
            additionalDocuments: {
                rendererParams: () => ({
                    className: styles.metadata,
                    pending: this.props.pending,
                    onUploadPending: this.props.onUploadPending,
                    onUpload: this.handleFileAdd,
                    files: this.props.files,
                }),
                component: AdditionalDocuments,
            },
            summary: {
                rendererParams: () => ({
                    className: styles.summary,
                    pending: this.props.pending,
                    onActiveSectorChange: this.props.onActiveSectorChange,
                }),
                component: Summary,
            },
            focuses: {
                rendererParams: () => ({
                    pending: this.props.pending,
                }),
                component: Focuses,
            },
            methodology: {
                rendererParams: () => ({
                    pending: this.props.pending,
                }),
                component: Methodology,
            },
            score: {
                rendererParams: () => ({
                    className: styles.score,
                    pending: this.props.pending,
                }),
                component: Score,
                // FIXME: this is a quick fix
                // Need to have a default value for elements in score
                // Shouldn't use 'defaultValue' prop of input
                mount: true,
                wrapContainer: true,
            },
            hno: {
                rendererParams: () => ({
                    className: styles.hno,
                    pending: this.props.pending,
                }),
                component: HNO,
            },
            cna: {
                rendererParams: () => ({
                    className: styles.cna,
                    pending: this.props.pending,
                }),
                component: CNA,
            },
        };
    }

    getTabs = memoize((tabs, showHNO, showCNA) => {
        if (!showHNO && !showCNA) {
            return tabs;
        }

        const newTabs = { ...tabs };

        if (showHNO) {
            newTabs.hno = _ts('editAssessment', 'hnoTabLabel');
        }
        if (showCNA) {
            newTabs.cna = _ts('editAssessment', 'cnaTabLabel');
        }

        return newTabs;
    })

    // NOTE: can be memoized
    calculateError = (tabKey) => {
        const {
            editAryFaramErrors: {
                metadata: {
                    additionalDocuments,
                    ...metadata
                } = {},
                methodology: {
                    focuses,
                    sectors,
                    affectedGroups,
                    locations,
                    ...methodology
                } = {},
                summary,
                score,
                questionnaire: {
                    hno,
                    cna,
                } = {},
            },
        } = this.props;

        switch (tabKey) {
            case 'metadata':
                return analyzeErrors(metadata);
            case 'additionalDocuments':
                return analyzeErrors(additionalDocuments);
            case 'focuses':
                return analyzeErrors({
                    focuses,
                    sectors,
                    affectedGroups,
                    locations,
                });
            case 'methodology':
                return analyzeErrors(methodology);
            case 'summary':
                return analyzeErrors(summary);
            case 'score':
                return analyzeErrors(score);
            case 'hno':
                return analyzeErrors(hno);
            case 'cna':
                return analyzeErrors(cna);
            default:
                return false;
        }
    }

    handleFileAdd = (file) => {
        const {
            activeLeadId,
            activeLeadGroupId,
            setFiles,
        } = this.props;

        setFiles({
            leadId: activeLeadId,
            leadGroupId: activeLeadGroupId,
            files: [file],
        });
    }

    handleFaramChange = (faramValues, faramErrors, faramInfo) => {
        const {
            editAryIsPristine,
            activeLeadId,
            changeAry,
            activeLeadGroupId,
        } = this.props;

        const isPristine = faramInfo.isComputed && editAryIsPristine;

        if (activeLeadId) {
            changeAry({
                leadId: activeLeadId,
                faramValues,
                faramErrors,
                isPristine,
            });
        } else {
            changeAry({
                leadGroupId: activeLeadGroupId,
                faramValues,
                faramErrors,
                isPristine,
            });
        }
    }

    tabRendererParams = (tabKey, data) => ({
        title: data,
        hasError: this.calculateError(tabKey),
    });

    render() {
        const {
            editAryFaramValues,
            editAryFaramErrors,
            schema,
            computeSchema,
            pending,
            readOnly,
            showHNO,
            showCNA,
        } = this.props;

        const tabs = this.getTabs(this.tabs, showHNO, showCNA);

        return (
            <Faram
                className={styles.rightPanel}
                schema={schema}
                computeSchema={computeSchema}
                value={editAryFaramValues}
                error={editAryFaramErrors}
                onChange={this.handleFaramChange}
                disabled={pending}
                readOnly={readOnly}
            >
                <ScrollTabs
                    className={styles.tabs}
                    useHash
                    defaultHash={this.defaultHash}
                    replaceHistory
                    tabs={tabs}
                    itemClassName={styles.tab}
                    renderer={NormalTabTitle}
                    rendererParams={this.tabRendererParams}
                />
                <MultiViewContainer
                    containerClassName={styles.container}
                    activeClassName={styles.active}
                    useHash
                    views={this.views}
                />
            </Faram>
        );
    }
}
