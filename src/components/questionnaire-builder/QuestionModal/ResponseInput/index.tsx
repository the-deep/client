import React, { useCallback, useMemo } from 'react';
import { FaramGroup } from '@togglecorp/faram';
import {
    _cs,
    isDefined,
    unique,
    isNotDefined,
} from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';
import TextInput from '#rsci/TextInput';
import List from '#rscv/List';

import {
    QuestionResponseOptionElement,
    LanguageTitle,
} from '#types';
import {
    isChoicedQuestionType,
    languageOptionsMap,
} from '#entities/questionnaire';

import styles from './styles.scss';

interface LanguageResponseOptionProps {
    languageKey: LanguageTitle['key'];
}

const LanguageResponseOption = ({ languageKey }: LanguageResponseOptionProps) => (
    <TextInput
        className={styles.textInput}
        faramElementName={languageKey}
        label={`Title: ${languageOptionsMap[languageKey]}`}
    />
);

const languageKeySelector = (l: LanguageTitle['key']) => l;

interface Props {
    className?: string;
    dataIndex: number;
    type?: string;
    moreTitles?: LanguageTitle[];
}

const deleteClick = (rows: QuestionResponseOptionElement[], index: number) => (
    rows.filter((row, ind) => ind !== index)
);

function ResponseItem(props: Props) {
    const {
        className,
        type,
        dataIndex,
        moreTitles,
    } = props;

    const languageKeys = useMemo(() => {
        if (isNotDefined(moreTitles)) {
            return [];
        }
        const uniqueItems = unique(moreTitles.filter(m => isDefined(m.key)), d => d.key);
        return (uniqueItems || []).map(m => m.key);
    }, [moreTitles]);

    const languageOptionRendererParams = useCallback((key: LanguageTitle['key']) => ({
        languageKey: key,
    }), []);

    if (!type || !isChoicedQuestionType(type)) {
        return null;
    }

    return (
        <div className={_cs(styles.responseItem, className)}>
            <h4 className={styles.heading}>
                {`${dataIndex + 1}.`}
            </h4>
            <FaramGroup faramElementName={String(dataIndex)}>
                <FaramGroup faramElementName="value">
                    <TextInput
                        className={styles.textInput}
                        faramElementName="defaultLabel"
                        label="Default title"
                    />
                    <List
                        data={languageKeys}
                        keySelector={languageKeySelector}
                        renderer={LanguageResponseOption}
                        rendererParams={languageOptionRendererParams}
                    />
                </FaramGroup>
            </FaramGroup>
            <DangerButton
                className={styles.deleteButton}
                iconName="delete"
                faramAction={deleteClick}
                faramElementName={dataIndex}
            />
        </div>
    );
}

export default ResponseItem;
