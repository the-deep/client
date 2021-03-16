import notify from '#notify';
import { Err } from '#utils/request/types';

// NOTE: for useRequest
export const notifyError = (title: string) => (
    (val: Err, error: Record<string, unknown>) => {
        const typedError = error as { messageForNotification: string } | undefined;

        notify.send({
            title,
            type: notify.type.ERROR,
            message: typedError && typedError.messageForNotification,
            duration: notify.duration.SLOW,
        });
    }
);

export const notifyOnFailure = (title: string) => (response: { error: object }) => {
    const { error } = response;

    const typedError = error as { messageForNotification: string } | undefined;

    notify.send({
        title,
        type: notify.type.ERROR,
        message: typedError && typedError.messageForNotification,
        duration: notify.duration.SLOW,
    });
};

export const notifyOnFatal = (title: string) => () => {
    notify.send({
        title,
        type: notify.type.ERROR,
        message: 'Some error occurred!',
        duration: notify.duration.MEDIUM,
    });
};

