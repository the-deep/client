import { requestMethods } from '#request';

export default {
    getBookRequest: {
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ response, params }) => params.setBook(response),
        // onFailure, onFatal
    },

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
