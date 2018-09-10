import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '#rsca/Button/PrimaryButton';

import ProjectMembershipPostRequest from '../../requests/ProjectMembershipRequest';
import ProjectUserGroupRequest from '../../requests/ProjectUserGroupRequest';


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
        this.createProjectUserGroupRequest = new ProjectUserGroupRequest({
            setState: () => {}, // TODO: add something functional. maybe to pull data from server
        });
    }

    addUser = () => {
        const { data: { projectId, id } } = this.props;
        const memberlist = [
            {
                project: projectId,
                member: id,
            },
        ];
        this.createProjectMembershipRequest.init(memberlist);
        this.createProjectMembershipRequest.start();
    }

    addUserGroup = () => {
        const { data: { projectId, id } } = this.props;
        const projectUserGroup = {
            project: projectId,
            usergroup: id,
        };
        this.createProjectUserGroupRequest.init(projectUserGroup);
        this.createProjectUserGroupRequest.start();
    }

    render() {
        const {
            data: {
                type,
                username,
                title,
            },
        } = this.props;

        if (type === 'user') {
            return (
                <div>
                    { username }
                    <PrimaryButton
                        onClick={this.addUser}
                    >
                        Add User
                    </PrimaryButton>
                </div>
            );
        } else if (type === 'user_group') {
            return (
                <div>
                    { title }
                    <PrimaryButton
                        onClick={this.addUserGroup}
                    >
                        Add UserGroup
                    </PrimaryButton>
                </div>
            );
        }
        // else
        console.warn('Invalid Search User/UserGroup type');
        return '';
    }
}
