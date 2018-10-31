import { requestMethods } from '#request';

export default {
    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => props.onDelete(),
    },

    saveRequest: {
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        query: { fields: 'sheets,options,fields,project' },
        body: ({ params: { body } }) => body,
        onSuccess: ({ params: { callback } }) => {
            callback();
        },
    },
};
