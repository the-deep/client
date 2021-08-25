import React, { memo, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

function splitHighlightText(text: string, highlightText: string) {
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
}

interface Props {
    className?: string;
    text?: string;
    highlightText?: string;
}

function HighlightableTextOutput(props: Props) {
    const {
        className,
        highlightText = '',
        text = '',
    } = props;

    const {
        start,
        highlight,
        end,
    } = useMemo(
        () => splitHighlightText(text, highlightText),
        [text, highlightText],
    );

    return (
        <div
            className={_cs(
                className,
                styles.highlightableTextOutput,
            )}
        >
            <div className={styles.start}>
                { start }
            </div>
            {highlight && (
                <div className={styles.highlight}>
                    { highlight }
                </div>
            )}
            {end && (
                <div className={styles.end}>
                    { end }
                </div>
            )}
        </div>
    );
}
export default memo(HighlightableTextOutput);
