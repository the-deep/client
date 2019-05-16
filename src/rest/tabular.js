import {
    wsEndpoint,
    PATCH,
    commonHeaderForPost,
    p,
} from '#config/rest';

export const createUrlForSheetDelete = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/?${p({ fields: ['id', 'hidden'] })}`
);
export const createParamsForSheetDelete = () => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        hidden: true,
    }),
});

export const createUrlForSheetEdit = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/?${p({ fields: ['id', 'title', 'data_row_index'] })}`
);
export const createParamsForSheetEdit = value => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(value),
});

// NOTE: some problem here
export const createUrlForFieldRetrieve = sheetId => (
    `${wsEndpoint}/tabular-sheets/${sheetId}/?${p({ fields: ['id'] })}`
);
export const createParamsForFieldRetrieve = fields => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        fields,
    }),
});

export const createUrlForFieldDelete = fieldId => (
    `${wsEndpoint}/tabular-fields/${fieldId}/?${p({ fields: ['id', 'hidden'] })}`
);
export const createParamsForFieldDelete = () => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        hidden: true,
    }),
});

export const createUrlForFieldEdit = fieldId => (
    `${wsEndpoint}/tabular-fields/${fieldId}/`
);
export const createParamsForFieldEdit = value => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify(value),
});

// NOTE: some problem here
export const createUrlForSheetRetrieve = bookId => (
    `${wsEndpoint}/tabular-books/${bookId}/?${p({ fields: ['id'] })}`
);
export const createParamsForSheetRetrieve = sheets => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        sheets,
    }),
});

// NOTE: some problem here
export const createUrlForSheetOptionsSave = bookId => (
    `${wsEndpoint}/tabular-books/${bookId}/?${p({ fields: ['id'] })}`
);
export const createParamsForSheetOptionsSave = sheets => ({
    method: PATCH,
    headers: commonHeaderForPost,
    body: JSON.stringify({
        sheets,
    }),
});
