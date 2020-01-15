import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';

import styles from './styles.scss';


interface Props {
    label?: string;
    className?: string;
}

const responseOptions = [
    { key: 1, value: 'Option 1' },
    { key: 2, value: 'Option 2' },
];

const OptionLabel = ({ optionLabel }) => <div>{optionLabel}</div>;


class ResponseInput extends React.PureComponent<Props> {
    render() {
        const {
            label,
            className,
        } = this.props;

        return (
            <div className={_cs(styles.responseInput, className)}>
                <div>
                    { label }
                </div>
                <ListView
                    data={responseOptions}
                    keySelector={d => d.key}
                    renderer={OptionLabel}
                    rendererParams={(_, d) => ({ optionLabel: d.value })}
                />
                <Button>
                    Add option
                </Button>
            </div>
        );
    }
}


export default FaramInputElement(ResponseInput);
