import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    mapToList,
} from '@togglecorp/fujs';

import ListView from '#rsu/../v2/View/ListView';
import List from '#rscv/List';
import TextOutput from '#components/general/TextOutput';
import {
    QuestionResponseOptionElement,
    LanguageTitle,
} from '#typings';
import {
    isChoicedQuestionType,
    languageOptionsMap,
} from '#entities/questionnaire';

import styles from './styles.scss';

interface ResponseOptionsProps {
    className?: string;
    searchValue?: string;
    optionValue: QuestionResponseOptionElement['value'];
    dataIndex: number;
}

const languageKeySelector = (l: LanguageTitle) => l.key;

const ResponseOption = ({
    className,
    searchValue,
    optionValue,
    dataIndex,
}: ResponseOptionsProps) => {
    const {
        defaultLabel,
        ...otherLanguages
    } = optionValue;

    const languageKeys = useMemo(() => (
        mapToList(
            otherLanguages,
            (d, k) => ({
                key: k,
                title: d,
            }),
        )
    ), [otherLanguages]);

    const languageOptionRendererParams = useCallback((key, data) => ({
        value: data.title,
        label: languageOptionsMap[key],
        searchValue,
    }), [searchValue]);

    return (
        <div className={_cs(styles.responseOption, className)}>
            <h5 className={styles.heading}>
                {`Option ${dataIndex + 1}`}
            </h5>
            <TextOutput
                label="Default Title"
                value={defaultLabel}
                searchValue={searchValue}
            />
            <List
                data={languageKeys}
                keySelector={languageKeySelector}
                renderer={TextOutput}
                rendererParams={languageOptionRendererParams}
            />
        </div>
    );
};

interface Props {
    className?: string;
    searchValue?: string;
    options?: QuestionResponseOptionElement[];
    itemClassName?: string;
    type: string;
}

const responseOptionKeySelector = (d: QuestionResponseOptionElement) => d.key;

function ResponseOutput(props: Props) {
    const {
        className,
        options,
        type,
        itemClassName,
        searchValue,
    } = props;

    const getResponseOptionRendererParams = useCallback((
        key: QuestionResponseOptionElement['key'],
        option: QuestionResponseOptionElement,
        dataIndex: number,
    ) => ({
        className: itemClassName,
        optionValue: option.value,
        dataIndex,
        searchValue,
    }), [itemClassName, searchValue]);

    if (!type || !isChoicedQuestionType(type)) {
        return null;
    }

    return (
        <ListView
            data={options}
            className={_cs(className)}
            keySelector={responseOptionKeySelector}
            renderer={ResponseOption}
            rendererParams={getResponseOptionRendererParams}
        />
    );
}

export default ResponseOutput;
