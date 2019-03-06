import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compareString } from '@togglecorp/fujs';
import Faram, { requiredCondition } from '@togglecorp/faram';

import update from '#rsu/immutable-update';
import NonFieldErrors from '#rsci/NonFieldErrors';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import TabularSelectInput from '#rsci/TabularSelectInput';

import {
    usersInformationListSelector,
    usergroupMembershipsSelector,

    setUsersInformationAction,
    addUsergroupViewMembershipsAction,
} from '#redux';
import _ts from '#ts';

import UsersGetRequest from '../../requests/UsersGetRequest';
import MembershipPostRequest from '../../requests/MembershipPostRequest';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    membershipsList: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupId: PropTypes.number, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setUsers: PropTypes.func.isRequired,
    addMemberships: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    userGroupId: undefined,
};

const mapStateToProps = state => ({
    users: usersInformationListSelector(state),
    membershipsList: usergroupMembershipsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    addMemberships: params => dispatch(addUsergroupViewMembershipsAction(params)),
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
            membershipsList,
            users,
        } = props;

        const usersWithRole = users.map(
            user => ({ ...user, role: 'normal' }),
        );
        const membersBlackList = membershipsList.map(d => d.member);

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
                                iconName={isAdmin ? 'locked' : 'person'}
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

        // Request
        this.usersRequest = new UsersGetRequest({
            setState: v => this.setState(v),
            setUsers: this.props.setUsers,
        });
        this.membershipPostRequest = new MembershipPostRequest({
            setState: v => this.setState(v),
            addMemberships: this.props.addMemberships,
            onModalClose: this.props.onModalClose,
        });
    }

    componentDidMount() {
        this.usersRequest.init().start();
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
        this.membershipPostRequest.stop();
        this.usersRequest.stop();
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

        this.membershipPostRequest.init(newMembersList, userGroupId).start();
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
