import React from 'react';

// Regex to split the string by the templates
const splitRegex = /({[^{}]*})/g;

// Regex to test if a piece of string is a template or not
//
// and if so capture the template key
const testRegex = /^{([^{}]*)}$/;

type ParamsValue = React.ReactNode;

type ParamsForString = {
    [key: string]: ParamsValue;
};

function hasReactElement(lst: ParamsValue[]): boolean {
    return !!lst.find((p) => React.isValidElement(p));
}

function renderElement(r: { key: string; value: React.ReactNode }) {
    return (
        <span key={r.key}>
            {r.value}
        </span>
    );
}

export default function generateString(str: string, params: ParamsForString) {
    // TODO: Support escaping { and }
    // TODO: Support array param values

    const splits = str.split(splitRegex);
    // Generate a list of {key, value} from the splits
    // replacing the templates with params.
    const results = splits.map((split, index) => {
        const test = testRegex.exec(split);
        if (!test) {
            return {
                key: `${split}-${index}`,
                value: split,
            };
        }

        const key = test[1];
        return {
            key,
            value: params[key],
        };
    });

    // If params contains a react element,
    // return a react fragment with the splits separated by
    // spans.
    const withReactElement = hasReactElement(Object.values(params).flat());
    const flattenedResults = results.flat();

    if (withReactElement) {
        return (
            <>
                {flattenedResults.map(renderElement)}
            </>
        );
    }
    // Otherwise, return the concatenated string.
    return flattenedResults.map((r) => r.value).join('');
}
