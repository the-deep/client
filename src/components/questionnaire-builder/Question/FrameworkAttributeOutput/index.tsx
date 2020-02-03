import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { QuestionElementFrameworkAttribute } from '#typings';

import styles from './styles.scss';

interface ItemWithTitle {
    id: string | number;
    title?: string;
}

interface Props {
    className?: string;
    data?: QuestionElementFrameworkAttribute;
    sectorList: ItemWithTitle[];
    subsectorList: ItemWithTitle[];
    dimensionList: ItemWithTitle[];
    subdimensionList: ItemWithTitle[];
}

class FrameworkAttributeOutput extends React.PureComponent<Props> {
    private getAttributeTitle = (
        type: QuestionElementFrameworkAttribute['type'],
        value: QuestionElementFrameworkAttribute['value'],
        sectorList: ItemWithTitle[],
        subsectorList: ItemWithTitle[],
        dimensionList: ItemWithTitle[],
        subdimensionList: ItemWithTitle[],
    ) => {
        const dataSource = {
            sector: sectorList,
            subsector: subsectorList,
            dimension: dimensionList,
            subdimension: subdimensionList,
        };

        const attribute = dataSource[type].find(d => d.id === value);
        if (attribute) {
            return attribute.title;
        }
        return '';
    }

    public render() {
        const {
            className,
            data,
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.props;

        if (!data) {
            return null;
        }

        const title = this.getAttributeTitle(
            data.type,
            data.value,
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        );

        return (
            <div className={_cs(className, styles.frameworkAttribute)}>
                { title }
            </div>
        );
    }
}

export default FrameworkAttributeOutput;
