import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';
import SearchInput from '#rsci/SearchInput';

import {
    usergroupMembershipsSelector,
    unsetUsergroupViewMembershipAction,

    setUsersMembershipAction,
    setUsergroupViewMembershipAction,
} from '#redux';
import _ts from '#ts';

import MembershipRoleChangeRequest from '../requests/MembershipRoleChangeRequest';
import MembershipDeleteRequest from '../requests/MembershipDeleteRequest';

import AddUserGroupMembers from './AddUserGroupMembers';
import ActionButtons from './ActionButtons';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    membershipList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
    setMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    membershipList: usergroupMembershipsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    unSetMembership: params => dispatch(unsetUsergroupViewMembershipAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
    setMembership: params => dispatch(setUsergroupViewMembershipAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class MembersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddMemberModal: false,
            searchMemberInputValue: '',
            membershipList: this.props.membershipList,
            actionPending: false,
        };

        this.memberHeaders = [
            {
                key: 'memberName',
                label: _ts('userGroup', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.memberName, b.memberName),
            },
            {
                key: 'memberEmail',
                label: _ts('userGroup', 'tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.memberEmail, b.memberEmail),
            },
            {
                key: 'role',
                label: _ts('userGroup', 'tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'joinedAt',
                label: _ts('userGroup', 'tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.joinedAt, b.jointedAt),
                modifier: row => <FormattedDate date={row.joinedAt} mode="dd-MM-yyyy hh:mm" />,
            },
            {
                key: 'actions',
                label: _ts('userGroup', 'tableHeaderActions'),
                order: 5,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        activeUser={this.props.activeUser}
                        isCurrentUserAdmin={this.props.isCurrentUserAdmin}
                        onRemoveMember={this.handleDeleteMemberClick}
                        onChangeMemberRole={this.handleToggleMemberRoleClick}
                    />
                ),
            },
        ];

        // Requests
        this.membershipRoleChangeRequest = new MembershipRoleChangeRequest({
            setState: v => this.setState(v),
            setMembership: this.props.setMembership,
        });
        this.membershipDeleteRequest = new MembershipDeleteRequest({
            setState: v => this.setState(v),
            unSetMembership: this.props.unSetMembership,
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            membershipList: nextProps.membershipList,
        });
    }

    componentWillUnmount() {
        this.membershipRoleChangeRequest.stop();
        this.membershipDeleteRequest.stop();
    }

    handleAddMemberClick = () => {
        this.setState({ showAddMemberModal: true });
    }

    handleAddMemberModalClose = () => {
        this.setState({ showAddMemberModal: false });
    }

    handleDeleteMemberClick = (selectedMember) => {
        const { userGroupId } = this.props;
        this.membershipDeleteRequest.init(selectedMember.id, userGroupId).start();
    };

    handleSearchMemberChange = (value) => {
        const { membershipList } = this.props;
        const filteredMemberData = membershipList.filter(
            member => caseInsensitiveSubmatch(member.memberName, value),
        );
        this.setState({
            searchMemberInputValue: value,
            membershipList: filteredMemberData,
        });
    }

    handleToggleMemberRoleClick = (selectedMember) => {
        const { userGroupId } = this.props;
        const newRole = selectedMember.role === 'admin' ? 'normal' : 'admin';
        this.membershipRoleChangeRequest.init(
            userGroupId,
            selectedMember.id,
            { newRole },
        ).start();
    }

    calcMemberKey = member => member.id;

    render() {
        const {
            className,
            isCurrentUserAdmin,
            userGroupId,
        } = this.props;
        const {
            membershipList,
            searchMemberInputValue,
            showAddMemberModal,
            actionPending,
        } = this.state;

        return (
            <div className={`${className} ${styles.members}`}>
                { actionPending && <LoadingAnimation /> }
                <div className={styles.header}>
                    <h2>
                        {_ts('userGroup', 'tableHeaderMembers')}
                    </h2>
                    <div className={styles.pusher} />
                    <SearchInput
                        placeholder={_ts('userGroup', 'placeholderSearch')}
                        onChange={this.handleSearchMemberChange}
                        value={searchMemberInputValue}
                        className={styles.searchInput}
                        showLabel={false}
                        showHintAndError={false}
                    />
                    {
                        isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddMemberClick}
                        >
                            {_ts('userGroup', 'addMemberButtonLabel')}
                        </PrimaryButton>
                    }
                </div>
                <div className={styles.content}>
                    <Table
                        data={membershipList}
                        headers={this.memberHeaders}
                        keySelector={this.calcMemberKey}
                    />
                </div>
                { showAddMemberModal &&
                    <Modal
                        className={styles.addMemberModal}
                        closeOnEscape
                        onClose={this.handleAddMemberModalClose}
                    >
                        <ModalHeader
                            title={_ts('userGroup', 'addMemberButtonLabel')}
                            rightComponent={
                                <PrimaryButton
                                    onClick={this.handleAddMemberModalClose}
                                    transparent
                                    iconName="close"
                                />
                            }
                        />
                        <ModalBody
                            className={styles.addMember}
                        >
                            <AddUserGroupMembers
                                userGroupId={userGroupId}
                                onModalClose={this.handleAddMemberModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
