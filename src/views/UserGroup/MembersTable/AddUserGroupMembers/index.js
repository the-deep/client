import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { compareString } from '#rsu/common';
import Faram, { requiredCondition } from '#rsci/Faram';
import update from '#rsu/immutable-update';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import TabularSelectInput from '#rsci/TabularSelectInput';

import {
    usersInformationListSelector,
    setUsersInformationAction,

    groupSelector,
    setUsersMembershipAction,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';

import UsersGetRequest from '../../requests/UsersGetRequest';
import MembershipPostRequest from '../../requests/MembershipPostRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    userGroupDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsers: PropTypes.func.isRequired,
    setUsersMembership: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    userGroupId: undefined,
};

const mapStateToProps = (state, props) => ({
    users: usersInformationListSelector(state, props),
    userGroupDetails: groupSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    setUsersMembership: params => dispatch(setUsersMembershipAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class AddUserGroupMembers extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.displayName;
    static optionKeySelector = (d = {}) => d.id;

    constructor(props) {
        super(props);

        const {
            userGroupDetails,
            users,
        } = props;

        const usersWithRole = users.map(
            user => ({ ...user, role: 'normal' }),
        );
        const membersBlackList = (userGroupDetails.memberships || emptyList).map(d => d.member);

        this.state = {
            faramErrors: {},
            faramValues: {},

            pending: false,
            pristine: false,
            usersWithRole,
            membersBlackList,
        };

        this.memberHeaders = [
            {
                key: 'displayName',
                label: _ts('userGroup', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.displayName, b.displayName),
            },
            {
                key: 'email',
                label: _ts('userGroup', 'tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.email, b.email),
            },
            {
                key: 'actions',
                label: _ts('userGroup', 'tableHeaderActions'),
                order: 3,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    const title = isAdmin ? (
                        _ts('userGroup', 'revokeAdminLinkTitle')
                    ) : (
                        _ts('userGroup', 'grantAdminLinkTitle')
                    );
                    return (
                        <div className="actions">
                            <PrimaryButton
                                title={title}
                                onClick={() => this.handleRoleChangeForNewMember(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                smallVerticalPadding
                                transparent
                            />
                        </div>
                    );
                },
            },
        ];

        this.schema = {
            fields: {
                memberships: [requiredCondition],
            },
        };
    }

    componentWillMount() {
        this.startRequestForUsers();
    }

    componentWillReceiveProps(nextProps) {
        const { users } = nextProps;

        if (this.props.users !== users) {
            const usersWithRole = users.map(
                user => ({ ...user, role: 'normal' }),
            );
            this.setState({ usersWithRole });
        }
    }

    componentWillUnmount() {
        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
    }

    startRequestForUsers = () => {
        if (this.usersRequest) {
            this.usersRequest.stop();
        }
        const usersRequest = new UsersGetRequest({
            setUsers: this.props.setUsers,
            setState: v => this.setState(v),
        });
        this.usersRequest = usersRequest.create();
        this.usersRequest.start();
    }

    startRequestForMembershipCreate = (memberList) => {
        if (this.membershipCreateRequest) {
            this.membershipCreateRequest.stop();
        }
        const { userGroupId } = this.props;
        const membershipCreateRequest = new MembershipPostRequest({
            setUsersMembership: this.props.setUsersMembership,
            onModalClose: this.props.onModalClose,
            setState: v => this.setState(v),
        });
        this.membershipCreateRequest = membershipCreateRequest.create(memberList, userGroupId);
        this.membershipCreateRequest.start();
    }

    handleRoleChangeForNewMember = (member) => {
        const { faramValues } = this.state;
        const index = (faramValues.memberships || emptyList).findIndex(m => m.id === member.id);
        if (index !== -1) {
            const settings = {
                memberships: {
                    [index]: {
                        role: {
                            $set: member.role === 'admin' ? 'normal' : 'admin',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);
            this.setState({
                faramValues: newFaramValues,
                pristine: true,
            });
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { userGroupId } = this.props;

        const newMembersList = values.memberships.map(member => ({
            member: member.id,
            role: member.role,
            group: userGroupId,
        }));

        this.startRequestForMembershipCreate(newMembersList);
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
            usersWithRole,
            membersBlackList,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addMemberForm}`}
                schema={this.schema}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                value={faramValues}
                errors={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    className={styles.nonFieldErrors}
                    faramElement
                />
                <TabularSelectInput
                    faramElementName="memberships"
                    className={styles.tabularSelect}
                    blackList={membersBlackList}
                    options={usersWithRole}
                    labelSelector={AddUserGroupMembers.optionLabelSelector}
                    keySelector={AddUserGroupMembers.optionKeySelector}
                    tableHeaders={this.memberHeaders}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('userGroup', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('userGroup', 'modalSave')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
