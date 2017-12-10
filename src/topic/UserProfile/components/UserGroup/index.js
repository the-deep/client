/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author jacky <prabes.pathak@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    PrimaryButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';
import { FgRestBuilder } from '../../../../public/utils/rest';
import { reverseRoute } from '../../../../public/utils/common';

import {
    pathNames,
} from '../../../../common/constants';
import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';
import {
    createParamsForUserGroups,
    createParamsForUserGroupsDelete,
    createUrlForUserGroup,
    createUrlForUserGroupsOfUser,
} from '../../../../common/rest';
import {
    userGroupsSelector,
    setUserGroupsAction,
    activeUserSelector,
    unSetUserGroupAction,
} from '../../../../common/redux';

import {
    UserGroupAdd,
} from '../../components/';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setUserGroups: PropTypes.func.isRequired,
    userGroups: PropTypes.array, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
    unSetUserGroup: PropTypes.func.isRequired,
};

const defaultProps = {
    match: {
        params: {},
    },
    userGroups: [],
};


const mapStateToProps = (state, props) => ({
    userGroups: userGroupsSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroups: params => dispatch(setUserGroupsAction(params)),
    unSetUserGroup: params => dispatch(unSetUserGroupAction(params)),
});

// TODO: move this to common
const dateComparator = (a, b) => {
    if (!a && !b) {
        return 1;
    } else if (!a) {
        return -1;
    } else if (!b) {
        return 1;
    }
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addUserGroup: false,

            // Delete Modal state
            deleteUserGroup: false,
            deletePending: false,

            // Active Delete state
            activeUserGroupDelete: null,
        };

        this.userGroupsTableHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 2,
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'joinedAt',
                label: 'Joined At',
                order: 3,
                sortable: true,
                comparator: (a, b) => dateComparator(a.joinedAt, b.joinedAt),
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
                    const { joinedAt } = membership || {};
                    return (
                        <FormattedDate
                            date={joinedAt}
                            mode="dd-MM-yyyy hh:mm"
                        />
                    );
                },
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 4,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return (
                            <Link
                                title="View UserGroup"
                                className={`
                                    ${styles['link-to-usergroup']}
                                    ${styles['action-button']}
                                `}
                                to={reverseRoute(pathNames.userGroup, { userGroupId: d.id })}
                            >
                                <i className="ion-android-open" />
                            </Link>
                        );
                    }

                    const onDeleteClick = () => this.handleDeleteUserGroupClick(d.id);
                    return ([
                        <Link
                            title="Edit UserGroup"
                            className={`
                                ${styles['link-to-usergroup']}
                                ${styles['action-button']}
                            `}
                            key="usergroup-panel"
                            to={reverseRoute(pathNames.userGroup, { userGroupId: d.id })}
                        >
                            <span className="ion-edit" />
                        </Link>,
                        <TransparentButton
                            key="delete"
                            title="Delete UserGroup"
                            className={`
                                ${styles['delete-btn']}
                                ${styles['action-button']}
                            `}
                            onClick={onDeleteClick}
                        >
                            <span className="ion-android-delete" />
                        </TransparentButton>,
                    ]);
                },
            },
        ];
        this.userGroupsTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props.match.params;
        this.userGroupsRequest = this.createRequestForUserGroups(userId);
        this.userGroupsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.userGroupsRequest.stop();
            this.userGroupsRequest = this.createRequestForUserGroups(userId);
            this.userGroupsRequest.start();
        }
    }

    componentWillUnmount() {
        this.userGroupsRequest.stop();
    }

    getActiveDeleteUserGroupType = () => 'User Group'

    getActiveDeleteUserGroupName = () => {
        const { userGroups } = this.props;
        const userGroup = userGroups.find(e => (
            e.id === this.state.activeUserGroupDelete
        ));
        return userGroup ? userGroup.title : null;
    }

    deleteActiveUserGroup = () => {
        if (this.userGroupDeleteRequest) {
            this.userGroupDeleteRequest.stop();
        }
        this.userGroupDeleteRequest = this.createRequestForUserGroupDelete(
            this.state.activeUserGroupDelete,
        );
        this.userGroupDeleteRequest.start();
    }

    createRequestForUserGroupDelete = (userGroupId) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userId = this.props.activeUser.userId;

        const userGroupDeletRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsDelete())
            .success(() => {
                try {
                    this.props.unSetUserGroup({
                        userGroupId,
                        userId,
                    });
                    this.setState({ deleteUserGroup: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .preLoad(() => {
                this.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.setState({ deletePending: false });
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userGroupDeletRequest;
    }

    createRequestForUserGroups = (userId) => {
        const userGroupsRequest = new FgRestBuilder()
            .url(createUrlForUserGroupsOfUser(userId))
            .params(() => createParamsForUserGroups())
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupsGetResponse');
                    this.props.setUserGroups({
                        userId,
                        userGroups: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return userGroupsRequest;
    }

    // BUTTONS

    handleAddUserGroupClick = () => {
        this.setState({ addUserGroup: true });
    }

    handleAddUserGroupClose = () => {
        this.setState({ addUserGroup: false });
    }

    // Table Actions

    // Delete Click
    handleDeleteUserGroupClick = (id) => {
        this.setState({
            deleteUserGroup: true,
            activeUserGroupDelete: id,
        });
    }

    // Delete Close
    handleDeleteUserGroupClose = () => {
        this.setState({ deleteUserGroup: false });
    }

    render() {
        const { userGroups, match, activeUser } = this.props;

        const {
            addUserGroup,
            deleteUserGroup,
            deletePending,
        } = this.state;

        const isCurrentUser = +match.params.userId === activeUser.userId;

        return (
            <div styleName="groups">
                <div styleName="header">
                    <h2>
                        Groups
                    </h2>
                    <div styleName="pusher" />
                    {
                        isCurrentUser &&
                        <div>
                            <PrimaryButton
                                onClick={this.handleAddUserGroupClick}
                            >
                                Add User Group
                            </PrimaryButton>
                        </div>
                    }
                </div>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddUserGroupClose}
                    show={addUserGroup}
                >
                    <ModalHeader title="Add User Group" />
                    <ModalBody>
                        <UserGroupAdd
                            handleModalClose={this.handleAddUserGroupClose}
                        />
                    </ModalBody>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteUserGroupClose}
                    show={deleteUserGroup}
                >
                    <ModalHeader title="Delete User Group" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteUserGroupClose}
                            handleDelete={this.deleteActiveUserGroup}
                            getName={this.getActiveDeleteUserGroupName}
                            getType={this.getActiveDeleteUserGroupType}
                            pending={deletePending}
                        />
                    </ModalBody>
                </Modal>
                <div styleName="usergroup-table">
                    <Table
                        data={userGroups}
                        headers={this.userGroupsTableHeaders}
                        keyExtractor={this.userGroupsTableKeyExtractor}
                    />
                </div>
            </div>
        );
    }
}
