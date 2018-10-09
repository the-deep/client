import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import BoundError from '#rscg/BoundError';
import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import AppError from '#components/AppError';

import {
    notificationsSelector,
    notificationsActivePageSelector,
    notificationsPerPageSelector,

    setNotificationsAction,
} from '#redux';
import _ts from '#ts';

import NotificationsGetRequest from './requests/NotificationsGetRequest';
import ProjectJoin from './ProjectJoin';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    notifications: PropTypes.array.isRequired,

    activePage: PropTypes.number.isRequired,
    notificationsPerPage: PropTypes.number.isRequired,

    setNotifications: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    notifications: notificationsSelector(state),
    activePage: notificationsActivePageSelector(state),
    notificationsPerPage: notificationsPerPageSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNotifications: params => dispatch(setNotificationsAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static notificationKeyExtractor = n => n.key;
    static notificationItems = {
        project_join_request: ProjectJoin,
    }

    constructor(props) {
        super(props);
        this.state = {
            notificationsLoading: true,
        };

        this.notificationsRequest = new NotificationsGetRequest({
            setState: d => this.setState(d),
            setNotifications: props.setNotifications,
        });
    }

    componentDidMount() {
        const {
            activePage,
            notificationsPerPage,
        } = this.props;

        this.notificationsRequest.init({
            activePage,
            notificationsPerPage,
        });
        this.notificationsRequest.start();
    }

    renderNotificationItem = (key, data) => {
        const NotificationItem = Notifications.notificationItems[data.type];

        return (
            <NotificationItem
                key={key}
                data={data}
            />
        );
    }

    renderEmptyComponent = () => (
        <div className={styles.emptyComponent} >
            {_ts('notifications', 'noNotificationsText')}
        </div>
    );

    render() {
        const { notificationsLoading } = this.state;
        const { notifications } = this.props;

        return (
            <div className={styles.notifications} >
                {notificationsLoading && <LoadingAnimation />}
                <header className={styles.header} >
                    <h2 className={styles.heading} >
                        {_ts('notifications', 'notificationHeaderTitle')}
                    </h2>
                </header>
                <ListView
                    className={styles.content}
                    data={notifications}
                    keySelector={Notifications.notificationKeyExtractor}
                    modifier={this.renderNotificationItem}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
