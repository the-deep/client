import { createSelector } from 'reselect';

const emptyList = [];

const pageSelector = ({ siloDomainData }) => siloDomainData.notificationsView;

export const notificationsSelector = createSelector(
    pageSelector,
    notificationsView => notificationsView.notifications || emptyList,
);

export const notificationsActivePageSelector = createSelector(
    pageSelector,
    notificationsView => notificationsView.activePage || 1,
);

export const notificationsPerPageSelector = createSelector(
    pageSelector,
    notificationsView => notificationsView.notificationsPerPage || 25,
);

export const totalNotificationsSelector = createSelector(
    pageSelector,
    notificationsView => notificationsView.totalNotifications || 0,
);

