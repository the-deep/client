import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import BoundError from '#rs/components/General/BoundError';

import AppError from '#components/AppError';
import {
    activeProjectIdFromStateSelector,

    leadGroupsForProjectSelector,
    totalLeadGroupsCountSelector,
    leadGroupsViewActivePageSelector,
    leadGroupsViewActiveSortSelector,
    leadGroupsViewFilterSelector,

    setLeadGroupsAction,
    setLeadGroupsActivePageAction,
    setLeadGroupsActiveSortAction,
} from '#redux';

import {
    iconNames,
    pathNames,
} from '#constants';

import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leadGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setLeadGroups: PropTypes.func.isRequired,
    totalLeadGroupsCount: PropTypes.number,
    setLeadGroupsActivePage: PropTypes.func.isRequired,
    setLeadGroupsActiveSort: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    leadGroups: [],
    totalLeadGroupsCount: 0,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),

    leadGroups: leadGroupsForProjectSelector(state, props),
    totalLeadGroupsCount: totalLeadGroupsCountSelector(state, props),
    activePage: leadGroupsViewActivePageSelector(state, props),
    activeSort: leadGroupsViewActiveSortSelector(state, props),
    filters: leadGroupsViewFilterSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setLeadGroups: params => dispatch(setLeadGroupsAction(params)),

    setLeadGroupsActivePage: params => dispatch(setLeadGroupsActivePageAction(params)),
    setLeadGroupsActiveSort: params => dispatch(setLeadGroupsActiveSortAction(params)),
});

const MAX_LEADGROUPS_PER_REQUEST = 25;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class LeadGroups extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { };
    }

    handlePageClick = (page) => {
        this.props.setAryPageActivePage({ activePage: page });
    }

    renderHeader = () => (
        <header className={styles.header} >
            {_ts('leadGroups', 'leadGroupsHeaderTitle')}
        </header>
    )

    renderFooter = () => {
        const {
            totalLeadGroupsCount,
            activePage,
        } = this.props;

        return (
            <footer className={styles.footer}>
                <div />
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={totalLeadGroupsCount}
                    maxItemsPerPage={MAX_LEADGROUPS_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    render() {
        const Header = this.renderHeader;
        return (
            <div className={styles.leadGroups} >
                Lead groups
            </div>
        );
    }
}
