import { requestMethods } from '#request';

export default {
    bookRequest: {
        onMount: true,
        onPropsChanged: ['bookId'],
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/processed/`,
        options: {
            pollTime: 1200,
            maxPollAttempts: 100,
            shouldPoll: r => r.status === 'pending',
        },
        onSuccess: ({ response, params: { setBook, setInvalid, pollFields } }) => {
            /*
            if (response.status === 'initial') {
                triggerExtraction();
                extraction request: {
                    method: requestMethods.POST,
                    url: ({ props }) => `/tabular-extraction-trigger/${props.bookId}/`,
                    onSuccess: ({ params: { startPolling } }) => startPolling(),
                }
            */
            if (response.status === 'success') {
                setBook(response);
                if (response.pendingFields && response.pendingFields.length > 0) {
                    pollFields(response.pendingFields);
                }
            } else {
                setInvalid();
            }
        },
        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
        // schemaName: 'TabularBookSchema',
    },

    pollRequest: {
        method: requestMethods.POST,
        url: ({ props }) => `/tabular-books/${props.bookId}/fields/`,
        body: ({ params: { fields } }) => ({ fields }),
        options: {
            // call this on certain delay
            delay: 3000,
        },
        onSuccess: ({ response, params: { pollFields, setFields } }) => {
            if (response.fields && response.fields.length > 0) {
                setFields(response.fields);
            }
            if (response.pendingFields && response.pendingFields.length > 0) {
                pollFields(response.pendingFields);
            }
        },
        onFailure: ({ params: { setInvalid } }) => setInvalid(),
        onFatal: ({ params: { setInvalid } }) => setInvalid(),
    },
};
