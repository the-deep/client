import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import { QuestionResponseOptionElement } from '#typings';

import styles from './styles.scss';

interface Props {
    className?: string;
    value: QuestionResponseOptionElement[];
    itemClassName?: string;
    type: string;
}

const responseOptionKeySelector = (d: QuestionResponseOptionElement) => d.key;

const ResponseOption = ({
    className,
    value,
}: {
    className?: string;
    value: QuestionResponseOptionElement;
}) => (
    <div className={_cs(styles.responseOption, className)}>
        { value.value }
    </div>
);

class ResponseOutput extends React.PureComponent<Props> {
    getResponseOptionRendererParams = (
        key: QuestionResponseOptionElement['key'],
        value: QuestionResponseOptionElement,
    ) => ({
        className: this.props.itemClassName,
        value,
    })

    public render() {
        const {
            className,
            value = [],
            type,
        } = this.props;

        if (type !== 'select') {
            return null;
        }

        return (
            <ListView
                data={value}
                className={_cs(styles.responseOutput, className)}
                keySelector={responseOptionKeySelector}
                renderer={ResponseOption}
                rendererParams={this.getResponseOptionRendererParams}
            />
        );
    }
}

export default ResponseOutput;
