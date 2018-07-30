import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '#rsu/common';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import Table from '#rscv/Table';
import SearchInput from '#rsci/SearchInput';

import {
    unSetMembershipAction,
    setUsersMembershipAction,
    setUserMembershipAction,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';

import MembershipRoleChangeRequest from '../requests/MembershipRoleChangeRequest';
import MembershipDeleteRequest from '../requests/MembershipDeleteRequest';

import AddUserGroupMembers from './AddUserGroupMembers';
import ActionButtons from './ActionButtons';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    memberData: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    unSetMembership: PropTypes.func.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number.isRequired,
    setUserMembership: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
};

const mapDispatchToProps = dispatch => ({
    unSetMembership: params => dispatch(unSetMembershipAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
    setUserMembership: params => dispatch(setUserMembershipAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class MembersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddMemberModal: false,
            searchMemberInputValue: '',
            memberData: this.props.memberData,
            actionPending: false,
            selectedMember: {},
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
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            memberData: nextProps.memberData,
        });
    }

    componentWillUnmount() {
        if (this.membershipRoleChangeRequest) {
            this.membershipRoleChangeRequest.stop();
        }
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }
    }

    startRequestForMembershipRoleChange = (params) => {
        if (this.membershipRoleChangeRequest) {
            this.membershipRoleChangeRequest.stop();
        }
        const { userGroupId } = this.props;
        const membershipRoleChangeRequest = new MembershipRoleChangeRequest({
            setUserMembership: this.props.setUserMembership,
            setState: v => this.setState(v),
        });
        this.membershipRoleChangeRequest = membershipRoleChangeRequest.create(
            params, userGroupId,
        );
        this.membershipRoleChangeRequest.start();
    }

    startRequestForMembershipDelete = (membershipId) => {
        if (this.membershipDeleteRequest) {
            this.membershipDeleteRequest.stop();
        }
        const { userGroupId } = this.props;
        const membershipDeleteRequest = new MembershipDeleteRequest({
            unSetMembership: this.props.unSetMembership,
            setState: v => this.setState(v),
        });
        this.membershipDeleteRequest = membershipDeleteRequest.create(
            membershipId, userGroupId,
        );
        this.membershipDeleteRequest.start();
    }

    handleAddMemberClick = () => {
        this.setState({ showAddMemberModal: true });
    }

    handleAddMemberModalClose = () => {
        this.setState({ showAddMemberModal: false });
    }

    handleDeleteMemberClick = (selectedMember) => {
        this.startRequestForMembershipDelete(selectedMember.id);
    };

    handleSearchMemberChange = (value) => {
        const { memberData } = this.props;
        const filteredMemberData = memberData.filter(
            member => caseInsensitiveSubmatch(member.memberName, value),
        );
        this.setState({
            searchMemberInputValue: value,
            memberData: filteredMemberData,
        });
    }

    handleToggleMemberRoleClick = (selectedMember) => {
        this.startRequestForMembershipRoleChange({
            membershipId: selectedMember.id,
            newRole: selectedMember.role === 'admin' ? 'normal' : 'admin',
        });
    }

    calcMemberKey = member => member.id;

    render() {
        const {
            memberData,
            searchMemberInputValue,
            showAddMemberModal,
            actionPending,
        } = this.state;

        return (
            <div className={`${this.props.className} ${styles.members}`}>
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
                        this.props.isCurrentUserAdmin &&
                        <PrimaryButton
                            onClick={this.handleAddMemberClick}
                        >
                            {_ts('userGroup', 'addMemberButtonLabel')}
                        </PrimaryButton>
                    }
                </div>
                <div className={styles.content}>
                    <Table
                        data={memberData}
                        headers={this.memberHeaders}
                        keyExtractor={this.calcMemberKey}
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
                                >
                                    <span className={iconNames.close} />
                                </PrimaryButton>
                            }
                        />
                        <ModalBody
                            className={styles.addMember}
                        >
                            <AddUserGroupMembers
                                userGroupId={this.props.userGroupId}
                                onModalClose={this.handleAddMemberModalClose}
                            />
                        </ModalBody>
                    </Modal>
                }
            </div>
        );
    }
}
