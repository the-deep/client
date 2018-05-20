import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import iconNames from '../../../../constants/iconNames';
import List from '../../../../vendor/react-store/components/View/List';
import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import ScaleInput from '../../../../vendor/react-store/components/Input/ScaleInput';

import {
    assessmentPillarsSelector,
    assessmentMatrixPillarsSelector,
    assessmentScoreScalesSelector,
    assessmentMinScaleValueSelector,
    assessmentMaxScaleValueSelector,
    assessmentMinScaleColorSelector,
    assessmentMaxScaleColorSelector,
    assessmentMinFinalScoreSelector,
    assessmentMaxFinalScoreSelector,
    editArySelectedSectorsSelector,
    assessmentSectorsSelector,
} from '../../../../redux';

import ScaleMatrixInput from './ScaleMatrixInput';
import ScoreItem from './ScoreItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    assessmentPillars: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    assessmentMatrixPillars: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    assessmentScoreScales: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sectors: PropTypes.array.isRequired,

    minScaleValue: PropTypes.number.isRequired,
    maxScaleValue: PropTypes.number.isRequired,
    minFinalScore: PropTypes.number.isRequired,
    maxFinalScore: PropTypes.number.isRequired,
    minScaleColor: PropTypes.string.isRequired,
    maxScaleColor: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    assessmentPillars: assessmentPillarsSelector(state),
    assessmentMatrixPillars: assessmentMatrixPillarsSelector(state),
    assessmentScoreScales: assessmentScoreScalesSelector(state),
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),

    minScaleValue: assessmentMinScaleValueSelector(state),
    maxScaleValue: assessmentMaxScaleValueSelector(state),
    minFinalScore: assessmentMinFinalScoreSelector(state),
    maxFinalScore: assessmentMaxFinalScoreSelector(state),
    minScaleColor: assessmentMinScaleColorSelector(state),
    maxScaleColor: assessmentMaxScaleColorSelector(state),
});

@connect(mapStateToProps, undefined)
export default class Score extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calculateScaleValues = (assessmentScoreScales = {}) => (
        assessmentScoreScales.reduce(
            (acc, row) => {
                acc[row.value] = {
                    title: row.title,
                    color: row.color,
                    default: row.default,
                };

                return acc;
            },
            {},
        )
    )

    constructor(props) {
        super(props);

        this.state = {
            scaleValues: Score.calculateScaleValues(props.assessmentScoreScales),
        };
    }

    componentWillReceiveProps(nextProps) {
        const { assessmentScoreScales: newAssessmentScoreScales } = nextProps;
        const { assessmentScoreScales: oldAssessmentScoreScales } = this.props;

        if (newAssessmentScoreScales !== oldAssessmentScoreScales) {
            const scaleValues = Score.calculateScaleValues(newAssessmentScoreScales);
            this.setState({ scaleValues });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.score,
        ];

        return classNames.join(' ');
    }

    renderQuestions = (k, data) => {
        const {
            title,
            description,
            id,
        } = data;

        const { scaleValues } = this.state;

        const iconClassName = [
            styles.infoIcon,
            iconNames.info,
        ].join(' ');

        return (
            <tr
                key={id}
                className={styles.row}
            >
                <td className={styles.cell}>
                    <div className={styles.content}>
                        <div className={styles.title}>
                            { title }
                        </div>
                        {
                            description && (
                                <span
                                    title={description}
                                    className={iconClassName}
                                />
                            )
                        }
                    </div>
                </td>
                <td className={styles.cell}>
                    <ScaleInput
                        faramElementName={String(id)}
                        options={scaleValues}
                    />
                </td>
            </tr>
        );
    }

    renderPillars = (k, data) => {
        const {
            title,
            questions,
            id,
        } = data;

        return (
            <FaramGroup key={id} faramElementName={String(id)}>
                <tr className={styles.headerRow}>
                    <td
                        className={styles.pillarTitle}
                        colSpan="2"
                    >
                        { title }
                    </td>
                </tr>
                <List
                    data={questions}
                    modifier={this.renderQuestions}
                />
            </FaramGroup>
        );
    }

    renderSummaryItem = (k, data) => {
        const {
            minScaleValue,
            maxScaleValue,
            minScaleColor,
            maxScaleColor,
        } = this.props;

        return (
            <ScoreItem
                className={styles.scaleItem}
                key={data.id}
                title={data.title}
                faramElementName={`${data.id}-score`}
                minValue={data.questions.length * minScaleValue}
                maxValue={data.questions.length * maxScaleValue}
                minColor={minScaleColor}
                maxColor={maxScaleColor}
            />
        );
    }

    renderMatrixSummaryItem = (k, data) => {
        const {
            minScaleValue,
            maxScaleValue,
            minScaleColor,
            maxScaleColor,
        } = this.props;

        return (
            <ScoreItem
                className={styles.scaleItem}
                key={data.id}
                title={data.title}
                faramElementName={`${data.id}-matrix-score`}
                minValue={minScaleValue * 5}
                maxValue={maxScaleValue * 5}
                minColor={minScaleColor}
                maxColor={maxScaleColor}
            />
        );
    }

    renderMatrixQuestion = (pillarData, sectorId) => {
        const { sectors } = this.props;
        const { scaleValues } = this.state;

        const currentSector = sectors.find(d => String(d.id) === String(sectorId));

        return (
            <div
                className={styles.matrixQuestion}
                key={sectorId}
            >
                { currentSector &&
                    <div className={styles.title}>
                        { currentSector.title }
                    </div>
                }
                <ScaleMatrixInput
                    faramElementName={String(sectorId)}
                    rows={pillarData.rows}
                    columns={pillarData.columns}
                    scaleValues={scaleValues}
                    scales={pillarData.scales}
                />
            </div>
        );
    }

    renderMatrixPillar = (kp, pillarData) => {
        const { selectedSectors } = this.props;
        return (
            <div
                key={pillarData.id}
                className={styles.matrixPillar}
            >
                <FaramGroup faramElementName={String(pillarData.id)}>
                    <div className={styles.title}>
                        { pillarData.title }
                    </div>
                    <ListView
                        className={styles.content}
                        data={selectedSectors}
                        modifier={(km, sectorData) => (
                            this.renderMatrixQuestion(pillarData, sectorData)
                        )}
                    />
                </FaramGroup>
            </div>
        );
    }

    render() {
        const {
            assessmentPillars,
            assessmentMatrixPillars,
            minFinalScore,
            maxFinalScore,
            minScaleColor,
            maxScaleColor,
        } = this.props;

        const className = this.getClassName();

        return (
            <div className={className}>
                <FaramGroup faramElementName="score">
                    <div className={styles.summary}>
                        <div className={styles.left}>
                            <List
                                data={assessmentPillars}
                                modifier={this.renderSummaryItem}
                            />
                            <List
                                data={assessmentMatrixPillars}
                                modifier={this.renderMatrixSummaryItem}
                            />
                        </div>
                        <div className={styles.right}>
                            {/* FIXME: use strings */}
                            <ScoreItem
                                className={styles.finalScoreItem}
                                title="Final score"
                                faramElementName="finalScore"
                                minValue={minFinalScore}
                                maxValue={maxFinalScore}
                                minColor={minScaleColor}
                                maxColor={maxScaleColor}
                            />
                        </div>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.left}>
                            <table className={styles.table}>
                                <tbody className={styles.body}>
                                    <FaramGroup faramElementName="pillars">
                                        <List
                                            data={assessmentPillars}
                                            modifier={this.renderPillars}
                                        />
                                    </FaramGroup>
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.right}>
                            <FaramGroup faramElementName="matrixPillars">
                                <List
                                    data={assessmentMatrixPillars}
                                    modifier={this.renderMatrixPillar}
                                />
                            </FaramGroup>
                        </div>
                    </div>
                </FaramGroup>
            </div>
        );
    }
}

