import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    highlightText: PropTypes.string,
    text: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    highlightText: undefined,
    text: undefined,
};

export default class HighlightableTextOutput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    splitHighlightText = memoize((text = '', highlightText = '') => {
        const testText = text.toLowerCase();
        const testHighlightText = highlightText.toLowerCase();

        const defaultOutput = {
            start: text,
            highlight: null,
            end: null,
        };

        if (text.length === 0) {
            return defaultOutput;
        }

        if (highlightText.length === 0) {
            return defaultOutput;
        }

        const highlightIndex = testText.indexOf(testHighlightText);
        if (highlightIndex === -1) {
            return defaultOutput;
        }

        const highlightEnd = highlightIndex + highlightText.length;
        const output = {
            start: text.substring(0, highlightIndex),
            highlight: text.substring(highlightIndex, highlightEnd),
            end: text.substring(highlightEnd),
        };

        return output;
    })

    render() {
        const {
            className,
            highlightText,
            text,
        } = this.props;

        const {
            start,
            highlight,
            end,
        } = this.splitHighlightText(text, highlightText);

        return (
            <div className={_cs(
                className,
                styles.highlightableTextOutput,
            )}
            >
                <div className={styles.start}>
                    { start }
                </div>
                { highlight && (
                    <div className={styles.highlight}>
                        { highlight }
                    </div>
                ) }
                { end && (
                    <div className={styles.end}>
                        { end }
                    </div>
                ) }
            </div>
        );
    }
}
