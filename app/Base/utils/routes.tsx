import React from 'react';

import Page, { Props as PageProps } from '#base/components/Page';

function joinUrlPart(foo: string, bar: string) {
    if (foo.endsWith('/')) {
        return foo.substring(0, foo.length - 1) + bar;
    }
    return foo + bar;
}

// eslint-disable-next-line import/prefer-default-export
export function wrap<T extends string, K extends { className?: string }>(
    props: PageProps<K> & { path: T, parent?: { path: string } },
) {
    const {
        path,
        component,
        componentProps,
        parent,
        ...otherProps
    } = props;

    return {
        ...otherProps,
        path: parent ? joinUrlPart(parent.path, path) : path,
        originalPath: path,
        load: (overrideProps: Partial<typeof componentProps>) => (
            <Page
                component={component}
                componentProps={componentProps}
                {...otherProps}
                {...overrideProps}
            />
        ),
    };
}
