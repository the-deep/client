import React from 'react';
import { _cs } from '@togglecorp/fujs';

import BoxBarChart from '#components/charts/BoxBarChart';

import styles from './styles.css';

const boxChartDummyData = [
    { count: 2, row: 'Province 1', column: 'CCCM' },
    { count: 9, row: 'Province 1', column: 'Health' },
    { count: 2, row: 'Province 1', column: 'Shelter' },
    { count: 7, row: 'Province 1', column: 'Nutrition' },
    { count: 1, row: 'Province 1', column: 'WASH' },
    { count: 5, row: 'Province 1', column: 'Shelter/NFIs' },
    { count: 2, row: 'Province 1', column: 'Education' },
    { count: 1, row: 'Province 1', column: 'Protection' },
    { count: 9, row: 'Province 2', column: 'CCCM' },
    { count: 2, row: 'Province 2', column: 'Health' },
    { count: 2, row: 'Province 2', column: 'Shelter' },
    { count: 1, row: 'Province 2', column: 'WASH' },
    { count: 6, row: 'Province 2', column: 'Shelter/NFIs' },
    { count: 2, row: 'Province 2', column: 'Education' },
    { count: 1, row: 'Province 2', column: 'Protection' },
    { count: 9, row: 'Province 3', column: 'CCCM' },
    { count: 2, row: 'Province 3', column: 'Health' },
    { count: 2, row: 'Province 3', column: 'Shelter' },
    { count: 1, row: 'Province 4', column: 'WASH' },
    { count: 6, row: 'Province 4', column: 'Shelter/NFIs' },
    { count: 2, row: 'Province 4', column: 'Education' },
    { count: 1, row: 'Province 4', column: 'Protection' },
];

interface Props {
    className?: string;
}

function MainFindings(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.mainFindings)}>
            <div className={styles.charts}>
                <BoxBarChart
                    data={boxChartDummyData}
                    columns={[
                        {
                            key: 'CCCM',
                            label: 'CCCM',
                        },
                        {
                            key: 'Health',
                            label: 'Health',
                        },
                        {
                            key: 'Random',
                            label: 'Random',
                        },
                    ]}
                    rowSelector={(item) => item.row}
                    columnSelector={(item) => item.column}
                    countSelector={(item) => item.count}
                />
            </div>
        </div>
    );
}

export default MainFindings;
