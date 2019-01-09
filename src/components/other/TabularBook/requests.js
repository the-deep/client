import { requestMethods } from '#request';
import _ts from '#ts';

import notify from '#notify';

export default {
    getBookRequest: {
        method: requestMethods.GET,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ response, params }) => params.setBook(response),
        schemaName: 'TabularBookSchema',
        // onFailure, onFatal
    },

    deleteRequest: {
        method: requestMethods.DELETE,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        onSuccess: ({ props }) => props.onDelete(),
        onFailure: ({ error = {} }) => {
            const { nonFieldErrors } = error;
            const displayError = nonFieldErrors
                ? nonFieldErrors.join(' ')
                : _ts('tabular', 'deleteFailed');
            notify.send({
                type: notify.type.ERROR,
                title: 'Tabular Book',
                message: displayError,
                duration: notify.duration.SLOW,
            });
        },
        onFatal: () => {
            notify.send({
                type: notify.type.ERROR,
                title: 'Tabular Book',
                message: _ts('tabular', 'deleteFailed'),
                duration: notify.duration.SLOW,
            });
        },
    },

    saveRequest: {
        method: requestMethods.PATCH,
        url: ({ props }) => `/tabular-books/${props.bookId}/`,
        body: ({ params: { body } }) => body,
        onSuccess: ({ response, params }) => {
            params.setBook(response);
        },
        // TODO: onFailure, onFatal
    },
};
