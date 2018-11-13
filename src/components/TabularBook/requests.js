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
        query: { fields: 'id,sheets,options,fields,project' },
        body: ({ params: { body } }) => body,
        onSuccess: ({ response, params: { callback } }) => {
            callback(response);
        },
    },
};
