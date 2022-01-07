import React from 'react';

import Page, { Props as PageProps } from '#base/components/Page';

function removeAsterisk(link: string) {
    if (link.endsWith('*')) {
        return link.slice(0, link.length - 1);
    }
    return link;
}

function joinUrlPart(foo: string, bar: string) {
    if (foo.endsWith('/')) {
        return foo.substring(0, foo.length - 1) + bar;
    }
    return foo + bar;
}

// eslint-disable-next-line import/prefer-default-export
export function wrap<T extends string, K extends { className?: string }>(
    props: Omit<PageProps<K>, 'overrideProps' | 'path'> & { path: T, parent?: { path: string } },
) {
    const {
        path,
        component,
        componentProps,
        parent,
        ...otherProps
    } = props;

    const fullPathForRoute = parent ? joinUrlPart(removeAsterisk(parent.path), path) : path;
    const fullPath = removeAsterisk(fullPathForRoute);

    return {
        ...otherProps,
        path: fullPath,
        pathForRoute: path,
        // NOTE: this is not used anywhere
        originalPath: path,
        load: (overrideProps: Partial<typeof componentProps>) => (
            <Page
                // NOTE: not setting key in Page will reuse the same Page
                path={fullPath}
                component={component}
                componentProps={componentProps}
                overrideProps={overrideProps}
                {...otherProps}
            />
        ),
    };
}
