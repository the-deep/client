import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Faram from '@togglecorp/faram';

import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,

    assessmentSchemaSelector,
    assessmentComputeSchemaSelector,
    editAryIsPristineSelector,

    changeAryForEditAryAction,

    editAryFaramValuesSelector,
    editAryFaramErrorsSelector,
    editAryShouldShowHNO,
    editAryShouldShowCNA,
} from '#redux';
import _ts from '#ts';
import TabTitle from '#components/general/TabTitle';

import Metadata from './Metadata';
import Summary from './Summary';
import Score from './Score';
import Methodology from './Methodology';
import HNO from './HNO';
import CNA from './CNA';

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

    editAryFaramValues: editAryFaramValuesSelector(state),
    editAryFaramErrors: editAryFaramErrorsSelector(state),

    schema: assessmentSchemaSelector(state),
    computeSchema: assessmentComputeSchemaSelector(state),

    showHNO: editAryShouldShowHNO(state),
    showCNA: editAryShouldShowCNA(state),
});

const mapDispatchToProps = dispatch => ({
    changeAry: params => dispatch(changeAryForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.tabs = {
            metadata: _ts('editAssessment', 'metadataTabLabel'),
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
                    onUploadPending: this.props.onUploadPending,
                }),
                component: Metadata,
            },
            summary: {
                rendererParams: () => ({
                    className: styles.summary,
                    pending: this.props.pending,
                    onActiveSectorChange: this.props.onActiveSectorChange,
                }),
                component: Summary,
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

    getTabs = (tabs, showHNO, showCNA) => {
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
        faramElementName: tabKey,
        title: data,
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
                    renderer={TabTitle}
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
