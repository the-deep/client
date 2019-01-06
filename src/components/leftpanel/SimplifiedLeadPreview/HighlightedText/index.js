import PropTypes from 'prop-types';
import React from 'react';

import Highlight from './Highlight';

const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
        item: PropTypes.object,
    })).isRequired,
    renderer: PropTypes.func,
    rendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    renderer: Highlight,
    rendererParams: undefined,
};


export default class HighlightedText extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createNestedSplits = (splits = []) => {
        const parents = [];
        const skip = {};
        for (let i = 0; i < splits.length; i += 1) {
            const parent = splits[i];

            if (skip[i]) {
                continue; // eslint-disable-line no-continue
            }

            const children = [];
            for (let j = i + 1; j < splits.length; j += 1) {
                const child = splits[j];
                if (
                    child.start < parent.end &&
                    child.end < parent.end
                ) {
                    skip[j] = true;
                    const newChild = {
                        ...child,
                        start: child.start - parent.start,
                        end: child.end - parent.start,
                    };
                    children.push(newChild);
                }
            }

            const newParent = {
                ...parent,
                children: HighlightedText.createNestedSplits(children),
            };
            parents.push(newParent);
        }

        return parents;
    }

    renderSplits = (text, splits, level = 1) => {
        const result = [];
        let index = 0;

        splits.forEach((split) => {
            const {
                start,
                end,
                key,
                item,
                children,
            } = split;

            const splitIndex = Math.max(index, start);
            if (index < splitIndex) {
                result.push(
                    <span key={`split-${level}-${start}`}>
                        { text.substr(index, splitIndex - index) }
                    </span>,
                );
            }
            if (splitIndex === end) {
                return;
            }

            const actualStr = text.substr(start, end - start);
            const splitStr = text.substr(splitIndex, end - splitIndex);

            const {
                renderer: Renderer,
                rendererParams,
            } = this.props;
            const otherProps = rendererParams ? rendererParams(key) : {};

            result.push(
                <Renderer
                    key={key}
                    highlightKey={key}
                    highlight={item}
                    actualStr={actualStr}
                    text={
                        children.length > 0
                            ? this.renderSplits(splitStr, children, level + 1)
                            : splitStr
                    }
                    {...otherProps}
                />,
            );

            index = end;
        });

        if (index < text.length) {
            result.push(
                <span key={`split-${level}`}>
                    { text.substr(index) }
                </span>,
            );
        }

        return result;
    }

    render() {
        const {
            className,
            highlights,
            text,
        } = this.props;

        // TODO: memoize this
        const nestedSplits = HighlightedText.createNestedSplits(highlights);

        return (
            <p className={className}>
                {this.renderSplits(text, nestedSplits)}
            </p>
        );
    }
}
