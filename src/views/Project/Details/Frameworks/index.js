import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    analysisFrameworkListSelector,
    projectDetailsSelector,

    setAnalysisFrameworksAction,
} from '#redux';

import _cs from '#cs';

import FrameworkDetail from './FrameworkDetail';
import styles from './styles.scss';

import FrameworkList from './FrameworkList';

const propTypes = {
    className: PropTypes.string,
    frameworkList: PropTypes.arrayOf(PropTypes.object).isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,

    // eslint-disable-next-line react/no-unused-prop-types
    setFrameworkList: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    frameworkList: [],
    readOnly: false,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    frameworkList: analysisFrameworkListSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setFrameworkList: params => dispatch(setAnalysisFrameworksAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            activeFrameworkId: undefined,

            filterValues: {
                activity: 'active',
                relatedToMe: false,
                search: '',
            },
        };
    }

    setActiveFramework = (id) => {
        this.setState({ activeFrameworkId: id });
    }

    handleFilterChange = (filterValues) => {
        this.setState({ filterValues });
    }

    render() {
        const {
            activeFrameworkId: activeFrameworkIdFromState,
            filterValues,
        } = this.state;

        const {
            frameworkList,
            projectDetails: {
                analysisFramework: usedFrameworkId,
            },
            projectId,
            readOnly,
            className,
        } = this.props;

        const activeFrameworkId = activeFrameworkIdFromState || usedFrameworkId;

        return (
            <div className={_cs(className, styles.projectAnalysisFramework)}>
                <FrameworkList
                    className={styles.frameworkList}

                    filterValues={filterValues}
                    frameworkList={frameworkList}
                    onFilterChange={this.handleFilterChange}
                    projectId={projectId}

                    activeFrameworkId={activeFrameworkId}
                    usedFrameworkId={usedFrameworkId}

                    readOnly={readOnly}

                    setActiveFramework={this.setActiveFramework}
                    setFrameworkList={this.props.setFrameworkList}
                />
                <FrameworkDetail
                    className={styles.details}
                    frameworkId={activeFrameworkId}
                    readOnly={readOnly}
                    setActiveFramework={this.setActiveFramework}
                />
            </div>
        );
    }
}
