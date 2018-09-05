import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import ProjectMembershipPostRequest from '../../requests/ProjectMembershipRequest';


const propTypes = {
    data: PropTypes.shape({
        type: PropTypes.string.isRequired,
        username: PropTypes.string,
        title: PropTypes.string,
        id: PropTypes.number.isRequired,
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        projectId: PropTypes.number,
    }).isRequired,
};

// Component for rendering each userAndUserGroups search result
// TODO: Beautify this
export default class SearchResult extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
        };
        this.createProjectMembershipRequest = new ProjectMembershipPostRequest({
            setState: () => {}, // TODO: add something functional. maybe to pull data from server
        });
    }

    addUser = () => {
        const memberlist = [
            {
                project: this.props.data.projectId,
                member: this.props.data.id,
            },
        ];
        this.createProjectMembershipRequest.init(memberlist);
        this.createProjectMembershipRequest.start();
    }
    addUserGroup = () => {
    }

    render() {
        const {
            data: {
                type,
                username,
                title,
            },
        } = this.props;

        let displayName = null;
        let addAction = () => {};

        if (type === 'user') {
            displayName = username;
            addAction = this.addUser;
        } else if (type === 'user_group') {
            displayName = title;
            addAction = this.addUserGroup;
        } else {
            console.warn('Invalid Search User/UserGroup type');
        }
        return (
            <div>
                { displayName }
                <PrimaryButton
                    onClick={addAction}
                >
                    Add User
                </PrimaryButton>
            </div>
        );
    }
}
