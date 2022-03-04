import { gql } from '@apollo/client';

export const LOGOUT = gql`
    mutation Logout {
        logout {
            ok
        }
    }
`;

export const USER_NOTIFICATIONS_COUNT = gql`
    query UserNotificationsCount {
        notifications(
            status: UNSEEN,
        ) {
            totalCount
        }
    }
`;
