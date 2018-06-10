// import schema from '#schema';
import Request from '#utils/Request';
import { randomString } from '#rs/utils/common';
import {
    createUrlForNotificationsGet,
    createParamsForGet,
    // transformResponseErrorToFormError,
} from '#rest';

export default class NotificationsGetRequest extends Request {
    handlePreLoad = () => {
        this.parent.setState({ notificationsLoading: true });
    }

    handlePostLoad = () => {
        this.parent.setState({ notificationsLoading: false });
    }

    handleSuccess = (response) => {
        // FIXME: write schema
        const notifications = [];
        response.results.forEach((n) => {
            notifications.push({
                ...n,
                key: randomString(16).toLowerCase(),
            });
        });

        this.parent.setNotifications({
            notifications,
            totalNotifications: response.count,
        });
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
        console.warn(urlForNotifications);

        this.createDefault({
            url: urlForNotifications,
            params: createParamsForGet,
        });
    }
}

