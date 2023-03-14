import React, { useCallback, useState, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { TextArea, TextInput, Button } from '@the-deep/deep-ui';
import { Chart } from 'react-google-charts';

import styles from './styles.css';

function WordTree() {
    const [text, setText] = useState();
    const [word, setWord] = useState();
    const [draw, setDraw] = useState(false);

    const options = useMemo(() => ({
        wordtree: {
            format: 'implicit',
            type: 'double',
            showTooltip: false,
            word,
        },
        showTooltip: false,
    }), [word]);

    const handleSetText = useCallback((value) => {
        if (draw) {
            setDraw(false);
        }
        setText(value?.toLowerCase());
    }, [draw]);

    const handleSetWord = useCallback((value) => {
        if (draw) {
            setDraw(false);
        }
        setWord(value?.toLowerCase());
    }, [draw]);

    const handleDrawChart = useCallback(() => {
        setDraw(true);
    }, []);

    const data = useMemo(() => (
        [['Phrases'], [text]]
    ), [text]);

    return (
        <div className={styles.wordTreeContainer}>
            <div className={styles.inputs}>
                <TextArea
                    className={styles.textArea}
                    label="Text"
                    name="text"
                    value={text}
                    onChange={handleSetText}
                    rows={10}
                />
                <TextInput
                    className={styles.textInput}
                    label="Word"
                    name="word"
                    value={word}
                    onChange={handleSetWord}
                />
                <Button
                    name={undefined}
                    onClick={handleDrawChart}
                    variant="primary"
                >
                    Generate Word Tree
                </Button>
            </div>

            {isDefined(text) && isDefined(word) && draw && (
                <Chart
                    chartType="WordTree"
                    width="100%"
                    height="100%"
                    data={[['Phrases'], ...data]}
                    options={options}
                />
            )}
        </div>
    );
}

export default WordTree;
