import React, { useCallback, useMemo, memo } from 'react';
import {
    Kraken,
    Message,
} from '@the-deep/deep-ui';
import { isDefined } from '@togglecorp/fujs';
import {
    Chart,
    type GoogleChartWrapper,
} from 'react-google-charts';

import styles from './styles.css';

interface Props {
    text: string;
    rootWord: string | undefined;
    onWordClick?: (word: string) => void,
}

function getMostCommonWord(text: string) {
    const words = text.match(/([!?,;:.&"-]+|\S*[A-Z]\.|\S*(?:[^!?,;:.\s&-]))/gm)
        ?.filter((word) => word.length > 2);

    let maxCount = 0;
    let mostCommonWord = words?.[0] ?? text;
    words?.reduce((acc, word) => {
        let currentVal = acc.get(word);
        if (currentVal) {
            acc.set(word, currentVal += 1);
            if (maxCount < currentVal) {
                maxCount = currentVal;
                mostCommonWord = word;
            }
        } else {
            acc.set(word, 1);
        }
        return acc;
    }, new Map<string, number>());

    return mostCommonWord;
}

function isWordPresent(text: string, word: string) {
    const words = text.match(/([!?,;:.&"-]+|\S*[A-Z]\.|\S*(?:[^!?,;:.\s&-]))/gm);
    return words?.some((w) => w === word);
}

interface WordTreeChartProps {
    text: string;
    word: string;
    onWordClick?: (word: string) => void;
}

function WordTreeChart(props: WordTreeChartProps) {
    const {
        text,
        word,
        onWordClick,
    } = props;

    const options = useMemo(() => ({
        wordtree: {
            format: 'implicit',
            type: 'double',
            showTooltip: false,
            word,
        },
        showTooltip: false,
    }), [word]);

    const handleSelect = useCallback(({ chartWrapper }: { chartWrapper: GoogleChartWrapper }) => {
        if (onWordClick) {
            const selection = chartWrapper.getChart().getSelection();
            // FIXME: Check behavior
            const selectedWord = (selection as unknown as { word: string }).word;
            onWordClick(selectedWord);
        }
    }, [onWordClick]);

    const chartEvents = useMemo(() => ([
        {
            eventName: 'select' as const,
            callback: handleSelect,
        },
    ]), [handleSelect]);

    const data = useMemo(() => (
        [['Phrases'], [text]]
    ), [text]);

    return (
        <Chart
            className={styles.wordTreeChart}
            chartType="WordTree"
            height="98%"
            width="99%"
            data={data}
            options={options}
            chartEvents={chartEvents}
        />
    );
}

function WordTree(props: Props) {
    const {
        text,
        rootWord: rootWordFromProps,
        onWordClick,
    } = props;

    const mostCommonWord = useMemo(() => (
        getMostCommonWord(text)
    ), [text]);

    const rootWord = useMemo(() => (
        isDefined(rootWordFromProps)
            && rootWordFromProps.trim().length > 0 ? rootWordFromProps : mostCommonWord
    ), [rootWordFromProps, mostCommonWord]);

    const isRootWordPresent = useMemo(() => {
        if (isDefined(rootWord)) {
            return isWordPresent(text, rootWord);
        }
        return false;
    }, [text, rootWord]);

    if (text.length < 1) {
        return (
            <Message
                className={styles.message}
                message="Empty text. Please add relevant text to visualize in word tree."
                icon={<Kraken variant="crutches" />}
            />
        );
    }

    if (!isRootWordPresent) {
        return (
            <Message
                className={styles.message}
                message="Root word is not present. Please add the word that is in the text."
                icon={<Kraken variant="search" />}
            />
        );
    }

    return (
        <WordTreeChart
            text={text}
            word={rootWord}
            onWordClick={onWordClick}
        />
    );
}

export default memo(WordTree);
