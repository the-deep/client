import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramGroup } from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import DangerButton from '#rsca/Button/DangerButton';
import { languageOptions } from '#entities/questionnaire';
import {
    Language,
    LanguageTitle,
} from '#types';

import styles from './styles.scss';

interface Props {
    className?: string;
    dataIndex: number;
}

const languageKeySelector = (l: Language) => l.key;
const languageLabelSelector = (l: Language) => l.label;

const deleteClick = (rows: LanguageTitle[], index: number) => (
    rows.filter((row, ind) => ind !== index)
);

function MoreTitleRow(props: Props) {
    const {
        className,
        dataIndex,
    } = props;

    return (
        <div className={_cs(styles.moreTitleRow, className)}>
            <FaramGroup
                faramElementName={String(dataIndex)}
            >
                <SelectInput
                    className={styles.selectInput}
                    faramElementName="key"
                    label="Language"
                    options={languageOptions}
                    keySelector={languageKeySelector}
                    labelSelector={languageLabelSelector}
                />
                <TextInput
                    className={styles.textInput}
                    faramElementName="title"
                    label="Title"
                />
            </FaramGroup>
            <DangerButton
                className={styles.button}
                iconName="delete"
                faramAction={deleteClick}
                faramElementName={dataIndex}
            />
        </div>
    );
}

export default MoreTitleRow;
