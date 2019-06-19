import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { FaramGroup } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';

import {
    aryTemplateQuestionnaireListSelector,
    assessmentMinScaleColorSelector,
    assessmentMaxScaleColorSelector,

    isUseCriteria,
} from '#redux';

import styles from './styles.scss';
import ScoreItem from '../Score/ScoreItem';
import ScoreMessage from '../Score/ScoreMessage';
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

    getSectors = memoize((sectors, method) => (
        sectors.filter(sector => (
            sector.subMethod === 'criteria' && !isUseCriteria(method, sector.id)
        ))
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
                            data={this.getSectors(data, method)}
                            keySelector={this.scoreItemKeySelector}
                            rendererParams={this.scoreItemRendererParams}
                            renderer={ScoreItem}
                        />
                        <div className={styles.right}>
                            <ScoreItem
                                className={styles.minimumRequirements}
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
                            <ScoreItem
                                className={styles.useCriteria}
                                // FIXME: use strings
                                title="Use"
                                faramElementName="use-criteria"
                                minValue={0}
                                maxValue={100}
                                minColor={minScaleColor}
                                maxColor={maxScaleColor}
                            />
                        </div>
                    </div>
                </FaramGroup>
                <ScoreMessage faramElementName={method} />
                <FaramGroup faramElementName={method}>
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
