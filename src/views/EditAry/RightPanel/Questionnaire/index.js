import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { FaramGroup } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';

import {
    aryTemplateQuestionnaireListSelector,
    assessmentMinScaleColorSelector,
    assessmentMaxScaleColorSelector,
} from '#redux';

import styles from './styles.scss';
import ScoreItem from '../Score/ScoreItem';
import Method from './Method';

const propTypes = {
    className: PropTypes.string,
    minScaleColor: PropTypes.string.isRequired,
    maxScaleColor: PropTypes.string.isRequired,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    method: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    data: [],
};

const mapStateToProps = state => ({
    questionnaireList: aryTemplateQuestionnaireListSelector(state),
    minScaleColor: assessmentMinScaleColorSelector(state),
    maxScaleColor: assessmentMaxScaleColorSelector(state),
});

const getMethodRendererParams = (_, d) => ({ data: d });
const methodKeySelector = d => d.id;

@connect(mapStateToProps)
export default class Questionnaire extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getCriteriaQuestions = memoize(questions => (
        questions.filter(question => question.subMethod === 'criteria')
    ));

    scoreItemKeySelector = item => item.id

    scoreItemRendererParams = (key, item) => ({
        faramElementName: `sector-${item.id}`,
        title: item.title,
        minValue: 0,
        maxValue: 100,
        minColor: this.props.minScaleColor,
        maxColor: this.props.maxScaleColor,
    })

    render() {
        const {
            className,
            data,
            minScaleColor,
            maxScaleColor,
            method,
        } = this.props;

        return (
            <FaramGroup faramElementName="questionnaire">
                <FaramGroup faramElementName={method}>
                    <div className={styles.summary}>
                        <ListView
                            className={styles.left}
                            data={this.getCriteriaQuestions(data)}
                            keySelector={this.scoreItemKeySelector}
                            rendererParams={this.scoreItemRendererParams}
                            renderer={ScoreItem}
                        />
                        <div className={styles.right}>
                            <ScoreItem
                                className={styles.minimumRequirement}
                                // FIXME: use strings
                                title="Minimum Requirement"
                                faramElementName="minimum-requirements"
                                minValue={0}
                                maxValue={100}
                                minColor={minScaleColor}
                                maxColor={maxScaleColor}
                            />
                            <ScoreItem
                                className={styles.allQualityCriteria}
                                // FIXME: use strings
                                title="All Quality Criteria"
                                faramElementName="all-quality-criteria"
                                minValue={0}
                                maxValue={100}
                                minColor={minScaleColor}
                                maxColor={maxScaleColor}
                            />
                        </div>
                    </div>
                    <FaramGroup faramElementName="questions">
                        <ListView
                            className={className}
                            data={data}
                            renderer={Method}
                            rendererParams={getMethodRendererParams}
                            keySelector={methodKeySelector}
                        />
                    </FaramGroup>
                </FaramGroup>
            </FaramGroup>
        );
    }
}
