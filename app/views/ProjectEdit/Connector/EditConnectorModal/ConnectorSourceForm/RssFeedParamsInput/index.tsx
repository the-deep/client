import React, { useEffect, useMemo } from 'react';
import {
    SetValueArg,
    Error,
    useFormObject,
    getErrorObject,
    getErrorString,
    PartialForm,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';
import { isValidUrl, isDefined, capitalize } from '@togglecorp/fujs';
import {
    SelectInput,
    TextInput,
    Spinner,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { mergeLists } from '#utils/common';
import {
    RssFieldsQuery,
    RssFieldsQueryVariables,
} from '#generated/types';

import {
    RssFeedParams,
} from '../../../types';

import styles from './styles.css';

const rssFeedDefaultValues: PartialForm<RssFeedParams> = {};

const RSS_FIELDS = gql`
    query RssFields($url: String) {
        rssFields(url: $url) {
            key
            label
        }
    }
`;

const keySelector = (d: { key: string; isStale: boolean }) => d.key;
const labelSelector = (d: { key: string; isStale: boolean }) => `${capitalize(d.key)}${d.isStale ? '(Removed)' : ''}`;

interface Props<T extends string> {
    name: T;
    value: PartialForm<RssFeedParams> | undefined | null;
    error: Error<RssFeedParams>;
    onChange: (val: SetValueArg<PartialForm<RssFeedParams>>, name: T) => void;
    disabled?: boolean;
    rssErrored: boolean;
    onRssErrorChange: (rssErrored: boolean) => void;
}

function RssFeedParamsInput<T extends string>(props: Props<T>) {
    const {
        name,
        value,
        error: riskyError,
        onChange,
        disabled,
        rssErrored,
        onRssErrorChange,
    } = props;

    const error = getErrorObject(riskyError);

    const setParamsFieldValue = useFormObject(name, onChange, value ?? rssFeedDefaultValues);

    const variables = useMemo(() => {
        const feedUrl = value?.['feed-url'];
        return (!feedUrl || !isValidUrl(feedUrl)) ? undefined : { url: feedUrl };
    }, [value]);

    const {
        previousData,
        data = previousData,
        loading,
        error: reqError,
    } = useQuery<RssFieldsQuery, RssFieldsQueryVariables>(
        RSS_FIELDS,
        {
            variables,
            skip: !variables,
        },
    );

    const options = useMemo(() => {
        const tempObj = { ...value };
        delete tempObj['feed-url'];
        const optionsFromCurrentValue = Object.values(tempObj).filter(isDefined);

        if (!data || !((data.rssFields?.length ?? 0) > 0)) {
            return optionsFromCurrentValue.map((option) => ({ key: option, isStale: true }));
        }

        return mergeLists(
            optionsFromCurrentValue.map((option) => ({ key: option, isStale: true })),
            (data.rssFields ?? []).map((option) => ({ key: option.key ?? '', isStale: false })),
            (d) => d.key,
            (_, newItem) => newItem,
        );
    }, [value, data]);

    const errorMessage = rssErrored ? 'RSS is invalid' : undefined;
    useEffect(() => {
        onRssErrorChange(isDefined(reqError));
    }, [
        onRssErrorChange,
        reqError,
    ]);

    return (
        <>
            <NonFieldError error={error} />
            <TextInput
                className={styles.url}
                name="feed-url"
                label="Feed URL"
                value={value?.['feed-url']}
                onChange={setParamsFieldValue}
                error={getErrorString(error?.['feed-url']) ?? errorMessage}
                disabled={disabled}
                actions={loading && (<Spinner />)}
            />
            <SelectInput
                name="url-field"
                label="URL"
                value={value?.['url-field']}
                onChange={setParamsFieldValue}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={getErrorString(error?.['url-field'])}
                disabled={disabled}
            />
            <SelectInput
                name="title-field"
                label="Title"
                value={value?.['title-field']}
                onChange={setParamsFieldValue}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={getErrorString(error?.['title-field'])}
                disabled={disabled}
            />
            <SelectInput
                name="date-field"
                label="Published Date"
                value={value?.['date-field']}
                onChange={setParamsFieldValue}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={getErrorString(error?.['date-field'])}
                disabled={disabled}
            />
            <SelectInput
                name="source-field"
                label="Publisher"
                value={value?.['source-field']}
                onChange={setParamsFieldValue}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={getErrorString(error?.['source-field'])}
                disabled={disabled}
            />
            <SelectInput
                name="author-field"
                label="Author"
                value={value?.['author-field']}
                onChange={setParamsFieldValue}
                options={options}
                keySelector={keySelector}
                labelSelector={labelSelector}
                error={getErrorString(error?.['author-field'])}
                disabled={disabled}
            />
        </>
    );
}

export default RssFeedParamsInput;
