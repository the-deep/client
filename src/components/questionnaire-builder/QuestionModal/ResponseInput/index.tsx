import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    unique,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import Label from '#rsci/Label';
import TextInput from '#rsci/TextInput';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';

import {
    QuestionResponseOptionElement,
    LanguageTitle,
} from '#typings';
import {
    isChoicedQuestionType,
    languageOptionsMap,
} from '#entities/questionnaire';

import styles from './styles.scss';

interface LanguageResponseOptionProps {
    languageKey: LanguageTitle['key'];
    onChange: (key: LanguageTitle['key'], newValue: string) => void;
    value: string;
}

function LanguageResponseOption(props: LanguageResponseOptionProps) {
    const {
        languageKey,
        onChange,
        value,
    } = props;

    const handleChange = useCallback((newVal: string) => {
        onChange(languageKey, newVal);
    }, [onChange, languageKey]);

    return (
        <TextInput
            value={value}
            label={languageOptionsMap[languageKey]}
            onChange={handleChange}
            showHintAndError={false}
        />
    );
}

interface QuestionResponseOptionsProps {
    className?: string;
    optionKey: QuestionResponseOptionElement['key'];
    option: QuestionResponseOptionElement;
    optionNumber: number;
    languageKeys: LanguageTitle['key'][];
    onChange: (
        optionKey: QuestionResponseOptionElement['key'],
        newValue: QuestionResponseOptionElement,
    ) => void;
    onDelete: (
        optionKey: QuestionResponseOptionElement['key'],
    ) => void;
}

const languageKeySelector = (l: LanguageTitle['key']) => l;

const QuestionResponseOption = ({
    onDelete,
    onChange,
    optionKey,
    option,
    className,
    optionNumber,
    languageKeys,
    ...otherProps
}: QuestionResponseOptionsProps) => {
    const handleChange = useCallback(
        (newValue: QuestionResponseOptionElement) => {
            onChange(optionKey, newValue);
        },
        [onChange, optionKey],
    );

    const handleDefaultValueChange = useCallback((newDefaultValue: string) => {
        const newOption = {
            ...option,
            value: newDefaultValue,
        };
        handleChange(newOption);
    }, [handleChange, option]);

    const handleLanguageValueChange = useCallback((languageKey, newLanguageValue: string) => {
        const newOption = {
            ...option,
            [languageKey]: newLanguageValue,
        };
        handleChange(newOption);
    }, [handleChange, option]);

    const handleDelete = useCallback(
        () => {
            onDelete(optionKey);
        },
        [onDelete, optionKey],
    );

    const languageOptionRendererParams = useCallback((key: LanguageTitle['key']) => ({
        languageKey: key,
        value: option[key],
        onChange: handleLanguageValueChange,
    }), [option, handleLanguageValueChange]);

    const defaultOptionValue = option.value;

    return (
        <div className={_cs(className, styles.responseOption)}>
            <h4 className={styles.optionHeader}>
                {`Option ${optionNumber}`}
            </h4>
            <div className={styles.content}>
                <TextInput
                    className={styles.textInput}
                    value={defaultOptionValue}
                    onChange={handleDefaultValueChange}
                    label="Default"
                    {...otherProps}
                />
                <ListView
                    data={languageKeys}
                    keySelector={languageKeySelector}
                    renderer={LanguageResponseOption}
                    rendererParams={languageOptionRendererParams}
                />
                <DangerButton
                    className={styles.deleteButton}
                    iconName="delete"
                    onClick={handleDelete}
                />
            </div>
        </div>
    );
};


interface Props {
    label?: string;
    className?: string;
    type?: string;
    value: QuestionResponseOptionElement[];
    onChange: (newValue: QuestionResponseOptionElement[]) => void;
    moreTitles?: LanguageTitle[];
}

const questionResponseKeySelector = (d: QuestionResponseOptionElement) => d.key;

function ResponseInput(props: Props) {
    const {
        type,
        label,
        className,
        value: options,
        onChange,
        moreTitles,
    } = props;

    const handleDeleteButtonClick = useCallback((optionKey: QuestionResponseOptionElement['key']) => {
        const newOption = [...(options || [])];
        const optionIndex = newOption.findIndex(d => d.key === optionKey);
        if (optionIndex !== -1) {
            newOption.splice(optionIndex, 1);
            onChange(newOption);
        }
    }, [options, onChange]);

    const handleOptionInputChange = useCallback((
        optionKey: QuestionResponseOptionElement['key'],
        newOption: QuestionResponseOptionElement,
    ) => {
        const newOptions = [...(options || [])];
        const optionIndex = newOptions.findIndex(d => d.key === optionKey);

        if (optionIndex !== -1) {
            newOptions.splice(optionIndex, 1, newOption);
            onChange(newOptions);
        }
    }, [options, onChange]);

    const handleAddOptionButtonClick = useCallback(() => {
        const newOptions = [...(options || [])];
        newOptions.push({
            key: `question-option-${randomString()}`,
            value: '',
        });

        onChange(newOptions);
    }, [options, onChange]);

    const languageKeys = useMemo(() => {
        if (isNotDefined(moreTitles)) {
            return [];
        }
        const uniqueItems = unique(moreTitles.filter(m => isDefined(m.key)), d => d.key);
        return (uniqueItems || []).map(m => m.key);
    }, [moreTitles]);

    const getOptionRendererParams = useCallback((
        key: QuestionResponseOptionElement['key'],
        option: QuestionResponseOptionElement,
        index: number,
    ) => ({
        optionNumber: index + 1,
        showHintAndError: false,
        optionKey: key,
        option,
        onChange: handleOptionInputChange,
        onDelete: handleDeleteButtonClick,
        languageKeys,
    }), [handleOptionInputChange, handleDeleteButtonClick, languageKeys]);

    if (!type || !isChoicedQuestionType(type)) {
        return null;
    }

    return (
        <div className={_cs(styles.responseInput, className)}>
            <Label
                text={label}
            />
            <ListView
                className={styles.optionList}
                data={options}
                keySelector={questionResponseKeySelector}
                renderer={QuestionResponseOption}
                rendererParams={getOptionRendererParams}
            />
            <Button
                onClick={handleAddOptionButtonClick}
                iconName="add"
            >
                {/* FIXME: use strings */}
                Add option
            </Button>
        </div>
    );
}


export default FaramInputElement(ResponseInput);
