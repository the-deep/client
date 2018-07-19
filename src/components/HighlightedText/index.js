import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    className: PropTypes.string,
    text: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.number,
        end: PropTypes.number,
        item: PropTypes.object,
    })).isRequired,
    renderer: PropTypes.func.isRequired,
    rendererParams: PropTypes.func,
};

const defaultProps = {
    className: '',
    rendererParams: undefined,
};


export default class HighlightedText extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static createNestedSplits = (splits = []) => {
        const parents = [];
        for (let i = 0; i < splits.length; i += 1) {
            const parent = splits[i];
            if (parent.added) {
                continue; // eslint-disable-line
            }
            parent.children = [];
            parent.added = true;

            for (let j = i + 1; j < splits.length; j += 1) {
                const child = splits[j];
                if (
                    child.start < parent.end &&
                    child.end < parent.end
                ) {
                    child.start -= parent.start;
                    child.end -= parent.start;
                    parent.children.push(child);
                }
            }

            parent.children = HighlightedText.createNestedSplits(parent.children);
            parents.push(parent);
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

        const highlightsCopy = highlights
            .filter(h => h.start >= 0)
            .map(h => ({ ...h }))
            .sort((h1, h2) => h1.start - h2.start);

        const nestedSplits = HighlightedText.createNestedSplits(highlightsCopy);

        return (
            <p className={className}>
                {this.renderSplits(text, nestedSplits)}
            </p>
        );
    }
}
