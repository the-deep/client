import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { QuestionElementFrameworkAttribute } from '#typings';

import styles from './styles.scss';

interface Props {
    className?: string;
    data: QuestionElementFrameworkAttribute;
}

class FrameworkAttributeOutput extends React.PureComponent<Props> {
    private getAttributeTitle = (
        type,
        value,
        sectorList,
        subsectorList,
        dimensionList,
        subdimensionList,
    ) => {
        const dataSource = {
            sector: sectorList,
            subsector: subsectorList,
            dimension: dimensionList,
            subdimension: subdimensionList,
        };

        const attribute = dataSource[type].find(d => d.id === value);

        return attribute.title;
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
