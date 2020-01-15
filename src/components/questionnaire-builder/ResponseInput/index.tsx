import React from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import DangerButton from '#rsca/Button/DangerButton';
import Label from '#rsci/Label';
import TextInput from '#rsci/TextInput';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';

import { QuestionResponseOptionElement } from '#typings';

import styles from './styles.scss';

interface Props {
    label?: string;
    className?: string;
    type?: string;
    value: QuestionResponseOptionElement[];
    onChange: (newValue: QuestionResponseOptionElement[]) => void;
}

const QuestionResponseOption = ({
    onDeleteButtonClick,
    optionKey,
    value,
    className,
    ...otherProps
}) => (
    <div className={_cs(className, styles.responseOption)}>
        <TextInput
            className={styles.textInput}
            value={value}
            {...otherProps}
        />
        <DangerButton
            className={styles.deleteButton}
            iconName="delete"
            onClick={() => onDeleteButtonClick(optionKey)}
        />
    </div>
);


class ResponseInput extends React.PureComponent<Props> {
    private getOptionRendererParams = (
        key: QuestionResponseOptionElement['key'],
        value: QuestionResponseOptionElement,
    ) => ({
        showLabel: false,
        showHintAndError: false,
        optionKey: key,
        value: value.value,
        onChange: (newValue: QuestionResponseOptionElement['key']) => { this.handleOptionInputChange(key, newValue); },
        onDeleteButtonClick: this.handleDeleteButtonClick,
        className: styles.option,
    })

    private handleDeleteButtonClick = (optionKey: QuestionResponseOptionElement['key']) => {
        const {
            value = [],
            onChange,
        } = this.props;

        const newOptionValue = [...value];
        const optionIndex = newOptionValue.findIndex(d => d.key === optionKey);

        if (optionIndex !== -1) {
            newOptionValue.splice(optionIndex, 1);
            onChange(newOptionValue);
        }
    };

    private handleOptionInputChange = (
        optionKey: QuestionResponseOptionElement['key'],
        newValue: QuestionResponseOptionElement['value'],
    ) => {
        const {
            value = [],
            onChange,
        } = this.props;

        const newOptionValue = [...value];
        const optionIndex = newOptionValue.findIndex(d => d.key === optionKey);

        if (optionIndex !== -1) {
            const newOption = { ...newOptionValue[optionIndex] };
            newOption.value = newValue;
            newOptionValue.splice(optionIndex, 1, newOption);

            onChange(newOptionValue);
        }
    }


    private handleAddOptionButtonClick = () => {
        const {
            value = [],
            onChange,
        } = this.props;
        const newValue = [...value];

        newValue.push({
            key: `question-option-${randomString(8)}`,
            value: '',
        });

        onChange(newValue);
    }

    public render() {
        const {
            type,
            label,
            className,
            value,
        } = this.props;

        if (type !== 'select') {
            return null;
        }

        return (
            <div className={_cs(styles.responseInput, className)}>
                <Label
                    text={label}
                />
                <ListView
                    className={styles.optionList}
                    data={value}
                    keySelector={d => d.key}
                    renderer={QuestionResponseOption}
                    rendererParams={this.getOptionRendererParams}
                />
                <Button
                    onClick={this.handleAddOptionButtonClick}
                    iconName="add"
                >
                    Add option
                </Button>
            </div>
        );
    }
}


export default FaramInputElement(ResponseInput);
