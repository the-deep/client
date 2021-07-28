import React from 'react';

import Page, { Props as PageProps } from '#base/components/Page';

// eslint-disable-next-line import/prefer-default-export
export function wrap<T extends string, K extends { className?: string }>(
    props: PageProps<K> & { path: T },
) {
    const {
        path,
        component,
        componentProps,
        ...otherProps
    } = props;

    return {
        ...otherProps,
        path,
        load: () => (
            <Page
                component={component}
                componentProps={componentProps}
                {...otherProps}
            />
        ),
    };
}
