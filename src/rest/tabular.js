import {
    wsEndpoint,
    PATCH,
    PUT,
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

export const createUrlForFieldDelete = fieldId => (
    `${wsEndpoint}/tabular-fields/${fieldId}/`
);
export const createParamsForFieldDelete = () => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        hidden: true,
    }),
});

export const createUrlForFieldRetrieve = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/`
);
export const createParamsForFieldRetrieve = fields => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        fields,
    }),
});

export const createUrlForFieldEdit = fieldId => (
    `${wsEndpoint}/tabular-field-update/${fieldId}/`
);
export const createParamsForFieldEdit = value => ({
    method: PUT,
    headers: commonHeaderForPost,
    body: JSON.stringify(value),
});
