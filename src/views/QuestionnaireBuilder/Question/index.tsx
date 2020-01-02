import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';


import {
    QuestionElement,
} from '#typings';

import styles from './styles.scss';

const Question = ({
    itemKey,
    question,
    className,
    onEditButtonClick,
}: {
    itemKey: QuestionElement['id'];
    question: QuestionElement;
    className?: string;
    onEditButtonClick: (itemKey: QuestionElement['id']) => void;
}) => (
    <div className={_cs(className, styles.question)}>
        <header className={styles.header}>
            <h4 className={styles.title}>
                { question.title }
            </h4>
            <div className={styles.actions}>
                <Button
                    iconName="edit"
                    onClick={() => onEditButtonClick(itemKey)}
                />
            </div>
        </header>
        <div className={styles.content}>
            Hello
        </div>
    </div>
);

export default Question;
