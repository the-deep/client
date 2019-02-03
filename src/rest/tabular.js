import {
    wsEndpoint,
    PATCH,
    commonHeaderForPost,
} from '#config/rest';

export const createUrlForSheetDelete = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/`
);
export const createParamsForSheetDelete = () => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        hidden: true,
    }),
});

export const createUrlForSheetEdit = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/`
);
export const createParamsForSheetEdit = value => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(value),
});

export const createUrlForSheetRetrieve = bookId => (
    `${wsEndpoint}/tabular-books/${bookId}/`
);
export const createParamsForSheetRetrieve = sheets => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        sheets,
    }),
});
