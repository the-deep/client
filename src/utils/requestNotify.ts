import notify from '#notify';

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

