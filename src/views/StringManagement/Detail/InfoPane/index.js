import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ListView from '../../../../vendor/react-store/components/View/List/ListView';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import Message from '../../../../vendor/react-store/components/View/Message';

import {
    problemCollectionSelector,
    problemCollectionStatsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    problemCollection: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemCollectionStats: PropTypes.object.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    problemCollection: problemCollectionSelector(state, props),
    problemCollectionStats: problemCollectionStatsSelector(state, props),
});

@connect(mapStateToProps)
export default class InfoPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // static keyExtractor = d => d;

    renderProblem = currentProblem => (key, d, i) => {
        let child = null;
        switch (currentProblem.title) {
            case 'Unused string':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.value}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                    </Fragment>
                );
                break;

            case 'Unused link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                    </Fragment>
                );
                break;
            case 'Undefined link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        <SuccessButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.add}
                            disabled
                        />
                    </Fragment>
                );
                break;
            case 'Bad link':
                child = (
                    <Fragment>
                        <span>{d}</span>
                        <WarningButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.edit}
                            disabled
                        />
                    </Fragment>
                );
                break;

            case 'Added link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.string}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Deleted link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.oldString}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Edited link':
                child = (
                    <Fragment>
                        <span>{d.key}: {d.oldString} → {d.string}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Added string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.value}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Deleted string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.oldValue}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            case 'Edited string':
                child = (
                    <Fragment>
                        <span>{d.id}: {d.oldValue} → {d.value}</span>
                        <DangerButton
                            transparent
                            smallVerticalPadding
                            iconName={iconNames.delete}
                            disabled
                        />
                        { d.message !== undefined &&
                            <div>{d.message}</div>
                        }
                    </Fragment>
                );
                break;
            default:
                break;
        }

        return (
            <div
                key={i}
                className={styles.item}
            >
                {child}
            </div>
        );
    }

    renderProblemGroup = (k, data) => {
        const { problemCollection } = this.props;
        const currentProblem = problemCollection[data];

        if (!currentProblem || currentProblem.instances.length === 0) {
            return null;
        }

        return (
            <div
                className={`${styles.problem} ${styles[currentProblem.type]}`}
                key={data}
            >
                <h4 className={styles.title}>
                    {currentProblem.title}
                </h4>
                <ListView
                    className={styles.instances}
                    data={currentProblem.instances}
                    // keyExtractor={InfoPane.keyExtractor}
                    modifier={this.renderProblem(currentProblem)}
                />
            </div>
        );
    }

    render() {
        const { problemCollectionStats } = this.props;

        const {
            errorCount = 0,
            warningCount = 0,
            infoCount = 0,
        } = problemCollectionStats;

        if (errorCount + warningCount + infoCount <= 0) {
            return (
                <Message className={styles.noProblems}>
                    Everything looks good
                </Message>
            );
        }

        const problemKeys = Object.keys(this.props.problemCollection);

        return (
            <ListView
                className={styles.problems}
                data={problemKeys}
                modifier={this.renderProblemGroup}
            />
        );
    }
}
