import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    RequestCoordinator,
    RequestClient,
    requestMethods,
} from '#request';

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
    // eslint-disable-next-line react/forbid-prop-types
    frameworkListGetRequest: PropTypes.object.isRequired,
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

const requests = {
    frameworkListGetRequest: {
        url: '/analysis-frameworks/',
        method: requestMethods.GET,
        query: ({ params: { body } }) => ({
            ...body,
            fields: ['id', 'title'],
        }),
        onSuccess: ({
            props: { setFrameworkList },
            response,
        }) => {
            const { results } = response;
            setFrameworkList({ analysisFrameworks: results });
        },
        schemaName: 'analysisFrameworkTitleList',
    },
};

const getActiveFrameworkId = memoize((
    activeFrameworkIdFromProject,
    frameworkList,
    activeFrameworkIdFromState,
) => {
    const activeFrameworkId = activeFrameworkIdFromState || activeFrameworkIdFromProject;
    if (activeFrameworkId) {
        const previouslyActiveFrameworkIndex = frameworkList.findIndex(
            f => f.id === activeFrameworkId,
        );

        if (previouslyActiveFrameworkIndex !== -1) {
            return activeFrameworkId;
        }
    }

    return frameworkList.length > 0 ?
        frameworkList[0].id : undefined;
});

const emptyObject = {};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requests)
export default class ProjectAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        const { frameworkListGetRequest } = this.props;

        const filterValues = {
            activity: 'active',
            relatedToMe: true,
            search: '',
        };

        this.state = {
            activeFrameworkId: undefined,
            // TODO: move to redux
            filterValues,
        };

        frameworkListGetRequest.setDefaultParams({
            body: filterValues,
        });
    }

    componentDidMount() {
        const { filterValues } = this.state;
        const { frameworkListGetRequest } = this.props;

        frameworkListGetRequest.do({
            body: filterValues,
        });
    }

    setActiveFramework = (id) => {
        this.setState({ activeFrameworkId: id });
    }

    handleFrameworkClick = (id) => {
        this.setActiveFramework(id);
    }

    handleFilterChange = (filterValues) => {
        this.setState({ filterValues });

        const { frameworkListGetRequest } = this.props;

        frameworkListGetRequest.do({
            body: filterValues,
        });
    }

    render() {
        const {
            activeFrameworkId: activeFrameworkIdFromState,
            filterValues,
        } = this.state;

        const {
            frameworkList,
            frameworkListGetRequest: {
                pending: frameworkListPending,
            } = emptyObject,
            projectDetails: {
                analysisFramework: selectedFrameworkId,
            },
            projectId,
            readOnly,
            className,
        } = this.props;

        const activeFrameworkId = getActiveFrameworkId(
            selectedFrameworkId,
            frameworkList,
            activeFrameworkIdFromState,
        );

        const isFrameworkListEmpty = !frameworkListPending && frameworkList.length === 0;

        return (
            <div className={_cs(className, styles.projectAnalysisFramework)}>
                <FrameworkList
                    activeFrameworkId={activeFrameworkId}
                    className={styles.frameworkList}
                    filterValues={filterValues}
                    frameworkList={frameworkList}
                    onClick={this.handleFrameworkClick}
                    onFilterChange={this.handleFilterChange}
                    frameworkListPending={frameworkListPending}
                    projectId={projectId}
                    readOnly={readOnly}
                    selectedFrameworkId={selectedFrameworkId}
                    setActiveFramework={this.setActiveFramework}
                />
                <FrameworkDetail
                    className={styles.details}
                    frameworkId={activeFrameworkId}
                    isFrameworkListEmpty={isFrameworkListEmpty}
                    readOnly={readOnly || frameworkListPending}
                    setActiveFramework={this.setActiveFramework}
                />
            </div>
        );
    }
}
