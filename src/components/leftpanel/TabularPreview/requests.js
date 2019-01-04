import { requestMethods } from '#request';

export default {
    initialRequest: {
        onMount: true,
        onPropsChanged: ['bookId'],

        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ response, params: {
            triggerExtraction,
            startPolling,
            setBook,
            setInvalid,
        } }) => {
            if (response.status === 'initial') {
                triggerExtraction();
            } else if (response.status === 'pending') {
                startPolling();
            } else if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
        schemaName: 'TabularBookSchema',
    },

    extractRequest: {
        method: requestMethods.POST,
        url: ({ props }) => `/tabular-extraction-trigger/${props.bookId}/`,
        onSuccess: ({ params: { startPolling } }) => startPolling(),
    },

    bookRequest: {
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => r.status === 'pending',
        },
        onSuccess: ({ response, params: { setBook, setInvalid } }) => {
            if (response.status === 'success') {
                setBook(response);
            } else {
                setInvalid();
            }
        },
        schemaName: 'TabularBookSchema',
    },
};
