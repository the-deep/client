import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import { FaramGroup } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

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
        className: styles.item,
        faramElementName: `sector-${item.id}`,
        title: item.title,
        minValue: 0,
        maxValue: 100,
        minColor: this.props.minScaleColor,
        maxColor: this.props.maxScaleColor,
        suffix: '%',
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
            <div className={_cs(className, styles.questionnaire)}>
                <FaramGroup faramElementName="questionnaire">
                    <div className={styles.summary}>
                        <div className={styles.details}>
                            <FaramGroup faramElementName={method}>
                                <ListView
                                    className={styles.left}
                                    data={this.getSectors(data, method)}
                                    keySelector={this.scoreItemKeySelector}
                                    rendererParams={this.scoreItemRendererParams}
                                    renderer={ScoreItem}
                                />
                            </FaramGroup>
                            <div className={styles.right}>
                                <FaramGroup faramElementName={method}>
                                    <div className={styles.rightScoreItems}>
                                        <ScoreItem
                                            className={_cs(styles.rightItem, styles.item)}
                                            // FIXME: use strings
                                            title="Minimum Requirement"
                                            faramElementName="minimum-requirements"
                                            minValue={0}
                                            maxValue={100}
                                            minColor={minScaleColor}
                                            maxColor={maxScaleColor}
                                            suffix="%"
                                        />
                                        <ScoreItem
                                            className={_cs(styles.rightItem, styles.item)}
                                            // FIXME: use strings
                                            title="All Quality Criteria"
                                            faramElementName="all-quality-criteria"
                                            minValue={0}
                                            maxValue={100}
                                            minColor={minScaleColor}
                                            maxColor={maxScaleColor}
                                            suffix="%"
                                        />
                                        <ScoreItem
                                            className={_cs(styles.rightItem, styles.item)}
                                            // FIXME: use strings
                                            title="Use"
                                            faramElementName="use-criteria"
                                            minValue={0}
                                            maxValue={100}
                                            minColor={minScaleColor}
                                            maxColor={maxScaleColor}
                                            suffix="%"
                                        />
                                    </div>
                                </FaramGroup>
                                <ScoreMessage faramElementName={method} />
                            </div>
                        </div>
                    </div>
                    <FaramGroup faramElementName={method}>
                        <FaramGroup faramElementName="questions">
                            <ListView
                                className={styles.questions}
                                data={data}
                                renderer={Method}
                                rendererParams={getMethodRendererParams}
                                keySelector={methodKeySelector}
                            />
                        </FaramGroup>
                    </FaramGroup>
                </FaramGroup>
            </div>
        );
    }
}
