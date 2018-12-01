import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

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

const notificationItems = {
    project_join_request: ProjectJoin,
};

const NotificationItem = ({ data }) => {
    const Item = notificationItems[data.type];

    if (Item) {
        return <Item data={data} />;
    }

    return null;
};

const notificationKeyExtractor = n => n.key;
const notificationItemRendererParams = (_, d) => ({ data: d });

@connect(mapStateToProps, mapDispatchToProps)
export default class Notifications extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            notificationsLoading: true,
        };

        this.notificationsRequest = new NotificationsGetRequest({
            setState: d => this.setState(d),
            setNotifications: this.props.setNotifications,
            onRequestSuccess: this.props.onRequestSuccess,
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

    renderEmptyComponent = () => (
        <div className={styles.emptyComponent} >
            {_ts('notifications', 'noNotificationsText')}
        </div>
    );

    render() {
        const { notificationsLoading } = this.state;
        const {
            notifications,
            className: classNameFromProps,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.notifications}
        `;

        return (
            <div className={className} >
                {notificationsLoading && <LoadingAnimation />}
                <header className={styles.header} >
                    <h3 className={styles.heading} >
                        {_ts('notifications', 'notificationHeaderTitle')}
                    </h3>
                </header>
                <ListView
                    className={styles.content}
                    data={notifications}
                    keySelector={notificationKeyExtractor}
                    renderer={NotificationItem}
                    rendererParams={notificationItemRendererParams}
                    emptyComponent={this.renderEmptyComponent}
                />
            </div>
        );
    }
}
