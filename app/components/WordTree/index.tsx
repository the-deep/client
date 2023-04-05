import React, { useMemo } from 'react';
import {
    Message,
} from '@the-deep/deep-ui';
import { isNotDefined, isDefined } from '@togglecorp/fujs';
import { Chart } from 'react-google-charts';

import styles from './styles.css';

interface Props {
    text: string;
    rootWord: string | undefined;
}

function getMostCommonWord(text: string) {
    const words = text.match(/([!?,;:.&"-]+|\S*[A-Z]\.|\S*(?:[^!?,;:.\s&-]))/gm);

    let maxCount = 0;
    let mostCommonWord;
    const wordsMap = words?.reduce((acc, word) => {
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

function WordTree(props: Props) {
    const {
        text,
        rootWord,
    } = props;

    const lowercasedText = useMemo(() => text.toLowerCase(), [text]);

    const isRootWordPresent = useMemo(() => {
        if (rootWord) {
            return isWordPresent(text, rootWord);
        }
        return false;
    }, [text, rootWord]);

    const mostCommonWord = useMemo(() => (
        getMostCommonWord(lowercasedText)
    ), [lowercasedText]);

    const options = useMemo(() => ({
        wordtree: {
            format: 'implicit',
            type: 'double',
            showTooltip: false,
            word: isRootWordPresent ? rootWord : mostCommonWord,
        },
        showTooltip: false,
    }), [mostCommonWord, rootWord]);

    const data = useMemo(() => (
        [['Phrases'], [lowercasedText]]
    ), [lowercasedText]);

    if (isDefined(rootWord) && !isRootWordPresent) {
        return (
            <Message
                className={styles.message}
                message="Root word is not present. Please add the word that is in the text."
            />
        );
    }
    if (text.length < 1) {
        return (
            <Message
                className={styles.message}
                message="Empty text. Please add relevant text to visualize in word tree."
            />
        );
    }

    return (
        <Chart
            className={styles.wordTreeChart}
            height="100%"
            width="100%"
            chartType="WordTree"
            data={data}
            options={options}
        />
    );
}

export default WordTree;
