import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import {
    projectIdFromRouteSelector,
    leadIdFromRouteSelector,
    entryIdFromRouteSelector,
} from '#redux';
import { pathNames } from '#constants';

const mapStateToProps = state => ({
    projectId: projectIdFromRouteSelector(state),
    leadId: leadIdFromRouteSelector(state),
    entryId: entryIdFromRouteSelector(state),
});

const propTypes = {
    projectId: PropTypes.number.isRequired,
    leadId: PropTypes.number.isRequired,
    entryId: PropTypes.number.isRequired,
};

class EntryCommentRedirect extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            projectId,
            leadId,
            entryId,
        } = this.props;

        const newRoute = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        });

        return (
            <Redirect
                to={`${newRoute}?entry_id=${entryId}&show_comment=true`}
            />
        );
    }
}

export default connect(mapStateToProps)(
    EntryCommentRedirect,
);
