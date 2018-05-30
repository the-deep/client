import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MultiViewContainer from '#rs/components/View/MultiViewContainer';
import FixedTabs from '#rs/components/View/FixedTabs';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import Faram, {
    requiredCondition,
    dateCondition,
} from '#rs/components/Input/Faram';
import { getObjectChildren } from '#rs/utils/common';
import { median, sum, bucket } from '#rs/utils/stats';

import {
    leadIdFromRouteSelector,
    leadGroupIdFromRouteSelector,

    aryTemplateMetadataSelector,
    aryTemplateMethodologySelector,
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentScoreBucketsSelector,

    setErrorAryForEditAryAction,
    setAryForEditAryAction,
    changeAryForEditAryAction,

    editAryFaramValuesSelector,
    editAryFaramErrorsSelector,
    editAryHasErrorsSelector,
    editAryIsPristineSelector,

} from '#redux';
import _ts from '#ts';
import Baksa from '#components/Baksa';

import AryPutRequest from '../requests/AryPutRequest';

import Metadata from './Metadata';
import Summary from './Summary';
import Score from './Score';
import Methodology from './Methodology';
import TabTitle from './TabTitle';
import styles from './styles.scss';

const emptyObject = {};

const propTypes = {
    activeLeadId: PropTypes.number,
    activeLeadGroupId: PropTypes.number,
    aryTemplateMetadata: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    aryTemplateMethodology: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    scorePillars: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    scoreMatrixPillars: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    scoreScales: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    scoreBuckets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    editAryFaramValues: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryFaramErrors: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    editAryHasErrors: PropTypes.bool.isRequired,
    editAryIsPristine: PropTypes.bool.isRequired,
    setErrorAry: PropTypes.func.isRequired,
    setAry: PropTypes.func.isRequired,
    changeAry: PropTypes.func.isRequired,
    onActiveSectorChange: PropTypes.func,
};

const defaultProps = {
    aryTemplateMetadata: [],
    aryTemplateMethodology: [],
    scorePillars: [],
    scoreMatrixPillars: [],
    scoreScales: [],
    scoreBuckets: [],
    editAryFaramErrors: {},
    editAryFaramValues: {},
    onActiveSectorChange: undefined,

    activeLeadId: undefined,
    activeLeadGroupId: undefined,
};

const mapStateToProps = state => ({
    activeLeadId: leadIdFromRouteSelector(state),
    activeLeadGroupId: leadGroupIdFromRouteSelector(state),
    aryTemplateMetadata: aryTemplateMetadataSelector(state),
    aryTemplateMethodology: aryTemplateMethodologySelector(state),
    scorePillars: assessmentPillarsSelector(state),
    scoreMatrixPillars: assessmentMatrixPillarsSelector(state),
    scoreScales: assessmentScoreScalesSelector(state),
    scoreBuckets: assessmentScoreBucketsSelector(state),

    editAryFaramValues: editAryFaramValuesSelector(state),
    editAryFaramErrors: editAryFaramErrorsSelector(state),
    editAryHasErrors: editAryHasErrorsSelector(state),
    editAryIsPristine: editAryIsPristineSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setErrorAry: params => dispatch(setErrorAryForEditAryAction(params)),
    setAry: params => dispatch(setAryForEditAryAction(params)),
    changeAry: params => dispatch(changeAryForEditAryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createSchema = (
        aryTemplateMetadata,
        aryTemplateMethodology,
        scorePillars,
        scoreMatrixPillars,
    ) => {
        const schema = { fields: {
            metadata: {
                fields: {
                    basicInformation: RightPanel.createBasicInformationSchema(aryTemplateMetadata),
                    additionalDocuments: RightPanel.createAdditionalDocumentsSchema(),
                },
            },
            methodology: RightPanel.createMethodologySchema(aryTemplateMethodology),
            summary: [],
            score: RightPanel.createScoreSchema(scorePillars, scoreMatrixPillars),
        } };
        return schema;
    }

    static createScoreSchema = (scorePillars, scoreMatrixPillars) => {
        const scoreSchema = {
            fields: {
                pillars: [],
                matrixPillars: [],

                finalScore: [],
            },
        };

        scorePillars.forEach((pillar) => {
            scoreSchema.fields[`${pillar.id}-score`] = [];
        });
        scoreMatrixPillars.forEach((pillar) => {
            scoreSchema.fields[`${pillar.id}-matrix-score`] = [];
        });

        return scoreSchema;
    }

    static createComputeSchema = (scorePillars, scoreMatrixPillars, scoreScales, scoreBuckets) => {
        if (scoreScales.length === 0) {
            return {};
        }

        const scoreSchema = {};

        const getScaleVal = v => scoreScales.find(s => String(s.value) === String(v)).value;

        scorePillars.forEach((pillar) => {
            scoreSchema[`${pillar.id}-score`] = (data, score) => {
                const pillarObj = getObjectChildren(score, ['pillars', pillar.id], emptyObject);
                const pillarValues = Object.values(pillarObj).map(v => getScaleVal(v));
                return sum(pillarValues);
            };
        });

        scoreMatrixPillars.forEach((pillar) => {
            const scales = Object.values(pillar.scales).reduce(
                (acc, b) => [...acc, ...Object.values(b)],
                [],
            );
            const getMatrixScaleVal = v => scales.find(s => String(s.id) === String(v)).value;

            scoreSchema[`${pillar.id}-matrix-score`] = (data, score) => {
                const pillarObj = getObjectChildren(score, ['matrixPillars', pillar.id], emptyObject);
                const pillarValues = Object.values(pillarObj).map(v => getMatrixScaleVal(v));
                return median(pillarValues) * 5;
            };
        });

        scoreSchema.finalScore = (data, score) => {
            const pillarScores = scorePillars.map(
                p => getObjectChildren(score, [`${p.id}-score`], 0) * p.weight,
            );
            const matrixPillarScores = scoreMatrixPillars.map(
                p => getObjectChildren(score, [`${p.id}-matrix-score`], 0) * p.weight,
            );

            const average = sum([...pillarScores, ...matrixPillarScores]);
            return bucket(average, scoreBuckets);
        };

        return { fields: {
            score: { fields: scoreSchema },
        } };
    }

    static createAdditionalDocumentsSchema = () => {
        const {
            bothPageRequiredCondition,
            validPageRangeCondition,
            validPageNumbersCondition,
            pendingCondition,
        } = Baksa;

        const schema = { fields: {
            executiveSummary: [
                bothPageRequiredCondition,
                validPageRangeCondition,
                validPageNumbersCondition,
                pendingCondition,
            ],
            assessmentData: [pendingCondition],
            questionnaire: [
                bothPageRequiredCondition,
                validPageRangeCondition,
                validPageNumbersCondition,
                pendingCondition,
            ],
        } };
        return schema;
    }

    static createBasicInformationSchema = (aryTemplateMetadata = {}) => {
        // Dynamic fields from metadataGroup
        const dynamicFields = {};
        Object.keys(aryTemplateMetadata).forEach((key) => {
            aryTemplateMetadata[key].fields.forEach((field) => {
                if (field.fieldType === 'date') {
                    dynamicFields[field.id] = [requiredCondition, dateCondition];
                } else {
                    dynamicFields[field.id] = [requiredCondition];
                }
            });
        });

        const schema = { fields: dynamicFields };
        return schema;
    }

    static createMethodologySchema = (aryTemplateMethodology = {}) => {
        const schema = { fields: {
            attributes: {
                member: { fields: {
                    // NOTE: inject here
                } },
                validation: (value) => {
                    const errors = [];
                    if (!value || value.length < 1) {
                        // FIXME: Use strings
                        errors.push('There should be at least one value');
                    }
                    return errors;
                },
            },

            sectors: [],
            focuses: [],
            locations: [],
            affectedGroups: [],

            objectives: [],
            dataCollectionTechniques: [],
            sampling: [],
            limitations: [],
        } };

        const dynamicFields = {};
        Object.keys(aryTemplateMethodology).forEach((key) => {
            const methodologyGroup = aryTemplateMethodology[key];
            methodologyGroup.fields.forEach((field) => {
                if (field.fieldType === 'date') {
                    dynamicFields[field.id] = [requiredCondition, dateCondition];
                } else {
                    dynamicFields[field.id] = [requiredCondition];
                }
            });
        });
        schema.fields.attributes.member.fields = dynamicFields;

        return schema;
    }

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            schema: RightPanel.createSchema(
                props.aryTemplateMetadata,
                props.aryTemplateMethodology,
                props.scorePillars,
                props.scoreMatrixPillars,
            ),
            computeSchema: RightPanel.createComputeSchema(
                props.scorePillars,
                props.scoreMatrixPillars,
                props.scoreScales,
                props.scoreBuckets,
            ),
        };

        this.tabs = {
            metadata: _ts('editAssessment', 'metadataTabLabel'),
            methodology: _ts('editAssessment', 'methodologyTabLabel'),
            summary: _ts('editAssessment', 'summaryTabLabel'),
            score: _ts('editAssessment', 'scoreTabLabel'),
        };

        this.defaultHash = 'metadata';

        this.views = {
            metadata: {
                component: () => (
                    <Metadata
                        className={styles.metadata}
                        pending={this.state.pending}
                    />
                ),
            },
            summary: {
                component: () => (
                    <Summary
                        className={styles.summary}
                        pending={this.state.pending}
                        onActiveSectorChange={this.props.onActiveSectorChange}
                    />
                ),
            },
            methodology: {
                component: () => (
                    <Methodology pending={this.state.pending} />
                ),
            },
            score: {
                component: () => (
                    <Score
                        className={styles.score}
                        pending={this.state.pending}
                    />
                ),
            },
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.aryTemplateMetadata !== nextProps.aryTemplateMetadata ||
            this.props.aryTemplateMethodology !== nextProps.aryTemplateMethodology ||
            this.props.scorePillars !== nextProps.scorePillars ||
            this.props.scoreMatrixPillars !== nextProps.scoreMatrixPillars
        ) {
            this.setState({
                schema: RightPanel.createSchema(
                    nextProps.aryTemplateMetadata,
                    nextProps.aryTemplateMethodology,
                    nextProps.scorePillars,
                    nextProps.scoreMatrixPillars,
                ),
            });
        }

        if (
            this.props.scorePillars !== nextProps.scorePillars ||
            this.props.scoreMatrixPillars !== nextProps.scoreMatrixPillars ||
            this.props.scoreScales !== nextProps.scoreScales ||
            this.props.scoreBuckets !== nextProps.scoreBuckets
        ) {
            this.setState({
                computeSchema: RightPanel.createComputeSchema(
                    nextProps.scorePillars,
                    nextProps.scoreMatrixPillars,
                    nextProps.scoreScales,
                    nextProps.scoreBuckets,
                ),
            });
        }
    }

    componentWillUnmount() {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
    }

    handleFaramChange = (faramValues, faramErrors, shouldChangePristine) => {
        if (this.props.activeLeadId) {
            this.props.changeAry({
                leadId: this.props.activeLeadId,
                faramValues,
                faramErrors,
                shouldChangePristine,
            });
        } else {
            this.props.changeAry({
                leadGroupId: this.props.activeLeadGroupId,
                faramValues,
                faramErrors,
                shouldChangePristine,
            });
        }
    }

    handleFaramValidationSuccess = (value) => {
        if (this.aryPutRequest) {
            this.aryPutRequest.stop();
        }
        const request = new AryPutRequest({
            setState: params => this.setState(params),
            setAry: this.props.setAry,
        });
        // TODO: add condition for ary put in case of lead group
        this.aryPutRequest = request.create(this.props.activeLeadId, value);
        this.aryPutRequest.start();
    };

    handleFaramValidationFailure = (faramErrors) => {
        if (this.props.activeLeadId) {
            this.props.setErrorAry({
                leadId: this.props.activeLeadId,
                faramErrors,
            });
        } else {
            this.props.setErrorAry({
                leadGroupId: this.props.activeLeadGroupId,
                faramErrors,
            });
        }
    };

    renderTab = (tabKey) => {
        const title = this.tabs[tabKey];

        return (
            <TabTitle
                title={title}
                faramElementName={tabKey}
            />
        );
    }

    render() {
        return (
            <Faram
                schema={this.state.schema}
                computeSchema={this.state.computeSchema}
                value={this.props.editAryFaramValues}
                error={this.props.editAryFaramErrors}
                className={styles.rightPanel}

                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onValidationFailure={this.handleFaramValidationFailure}
                disabled={this.state.pending}
            >
                <FixedTabs
                    className={styles.tabs}
                    useHash
                    defaultHash={this.defaultHash}
                    replaceHistory
                    tabs={this.tabs}
                    modifier={this.renderTab}
                >
                    <SuccessButton
                        className={styles.saveButton}
                        type="submit"
                        disabled={
                            this.props.editAryIsPristine
                            || this.props.editAryHasErrors
                            || this.state.pending
                        }
                    >
                        {/* FIXME: use strings */}
                        Save
                    </SuccessButton>
                </FixedTabs>
                <MultiViewContainer
                    useHash
                    views={this.views}
                />
            </Faram>
        );
    }
}
