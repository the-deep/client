// import schema from '#schema';
import Request from '#utils/Request';
import { randomString } from '#rsu/common';
import {
    createUrlForNotificationsGet,
    createParamsForGet,
    // transformResponseErrorToFormError,
} from '#rest';

export default class NotificationsGetRequest extends Request {
    schemaName = 'notifications'

    handlePreLoad = () => {
        this.parent.setState({ notificationsLoading: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ notificationsLoading: false });
    }

    handleSuccess = (response) => {
        const notifications = [];
        response.results.forEach((n) => {
            notifications.push({
                ...n,
                key: randomString(16),
            });
        });

        this.parent.setNotifications({
            notifications,
            totalNotifications: response.count,
        });

        if (this.parent.onRequestSuccess) {
            this.parent.onRequestSuccess();
        }
    }

    init = ({
        activePage,
        notificationsPerPage,
    }) => {
        const notificationsRequestOffset = (activePage - 1) * notificationsPerPage;
        const notificationsRequestLimit = notificationsPerPage;

        const urlForNotifications = createUrlForNotificationsGet({
            offset: notificationsRequestOffset,
            limit: notificationsRequestLimit,
        });

        this.createDefault({
            url: urlForNotifications,
            params: createParamsForGet,
        });
    }
}

