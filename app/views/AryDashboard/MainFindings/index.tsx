import React from 'react';
import { _cs } from '@togglecorp/fujs';

import BubbleBarChart from '#components/charts/BubbleBarChart';
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

const dummyData = [
    { date: '2022-12-24', count: 8, category: 'Item 5' },
    { date: '2022-11-07', count: 1, category: 'Item 3' },
    { date: '2023-09-07', count: 1, category: 'Item 6' },
    { date: '2022-10-19', count: 10, category: 'Item 2' },
    { date: '2022-10-18', count: 9, category: 'Item 3' },
    { date: '2022-07-05', count: 1, category: 'Item 2' },
    { date: '2023-06-08', count: 6, category: 'Item 5' },
    { date: '2023-07-17', count: 5, category: 'Item 1' },
    { date: '2022-10-26', count: 1, category: 'Item 2' },
    { date: '2022-10-31', count: 8, category: 'Item 5' },
    { date: '2023-08-13', count: 8, category: 'Item 5' },
    { date: '2022-08-06', count: 3, category: 'Item 5' },
    { date: '2023-07-03', count: 2, category: 'Item 4' },
    { date: '2022-09-28', count: 7, category: 'Item 4' },
    { date: '2022-07-22', count: 8, category: 'Item 2' },
    { date: '2023-04-04', count: 1, category: 'Item 5' },
    { date: '2023-04-18', count: 2, category: 'Item 3' },
    { date: '2022-12-15', count: 1, category: 'Item 3' },
    { date: '2022-10-22', count: 10, category: 'Item 4' },
    { date: '2023-01-11', count: 1, category: 'Item 6' },
    { date: '2023-03-27', count: 9, category: 'Item 6' },
    { date: '2023-03-08', count: 8, category: 'Item 2' },
    { date: '2022-10-07', count: 8, category: 'Item 6' },
    { date: '2023-07-17', count: 7, category: 'Item 2' },
    { date: '2023-06-21', count: 9, category: 'Item 1' },
    { date: '2023-07-08', count: 1, category: 'Item 3' },
    { date: '2022-11-27', count: 9, category: 'Item 2' },
    { date: '2022-12-02', count: 7, category: 'Item 1' },
    { date: '2022-09-25', count: 1, category: 'Item 6' },
    { date: '2023-02-18', count: 1, category: 'Item 2' },
    { date: '2023-01-03', count: 2, category: 'Item 2' },
    { date: '2023-01-26', count: 2, category: 'Item 2' },
    { date: '2022-09-10', count: 2, category: 'Item 5' },
    { date: '2023-06-22', count: 2, category: 'Item 3' },
    { date: '2022-07-17', count: 3, category: 'Item 1' },
    { date: '2023-06-27', count: 4, category: 'Item 3' },
    { date: '2023-02-25', count: 1, category: 'Item 3' },
    { date: '2022-12-09', count: 2, category: 'Item 4' },
    { date: '2022-11-24', count: 9, category: 'Item 4' },
    { date: '2023-02-26', count: 9, category: 'Item 4' },
    { date: '2023-02-15', count: 2, category: 'Item 2' },
    { date: '2023-07-20', count: 9, category: 'Item 3' },
    { date: '2023-05-07', count: 4, category: 'Item 5' },
    { date: '2022-08-15', count: 3, category: 'Item 4' },
    { date: '2023-02-20', count: 8, category: 'Item 4' },
    { date: '2023-08-17', count: 5, category: 'Item 2' },
    { date: '2023-04-03', count: 8, category: 'Item 4' },
    { date: '2022-09-22', count: 10, category: 'Item 2' },
    { date: '2023-02-05', count: 8, category: 'Item 4' },
    { date: '2023-03-18', count: 7, category: 'Item 6' },
];

const dummyDataForWeek = [
    { count: 7, date: '2023-08-07', category: 'Item 1' },
    { count: 4, date: '2023-07-18', category: 'Item 2' },
    { count: 6, date: '2023-08-13', category: 'Item 4' },
    { count: 8, date: '2023-06-02', category: 'Item 4' },
    { count: 3, date: '2023-07-25', category: 'Item 6' },
    { count: 5, date: '2023-08-01', category: 'Item 3' },
    { count: 10, date: '2023-06-19', category: 'Item 7' },
    { count: 9, date: '2023-08-19', category: 'Item 5' },
    { count: 9, date: '2023-07-26', category: 'Item 7' },
    { count: 7, date: '2023-08-19', category: 'Item 1' },
    { count: 8, date: '2023-09-06', category: 'Item 3' },
    { count: 9, date: '2023-09-05', category: 'Item 7' },
    { count: 1, date: '2023-06-27', category: 'Item 1' },
    { count: 4, date: '2023-06-03', category: 'Item 4' },
    { count: 8, date: '2023-06-13', category: 'Item 3' },
    { count: 9, date: '2023-07-22', category: 'Item 5' },
    { count: 5, date: '2023-06-29', category: 'Item 6' },
    { count: 8, date: '2023-08-12', category: 'Item 5' },
    { count: 3, date: '2023-07-21', category: 'Item 5' },
    { count: 10, date: '2023-06-15', category: 'Item 5' },
    { count: 8, date: '2023-08-20', category: 'Item 3' },
    { count: 2, date: '2023-07-11', category: 'Item 6' },
    { count: 3, date: '2023-07-04', category: 'Item 4' },
    { count: 9, date: '2023-06-15', category: 'Item 3' },
    { count: 8, date: '2023-07-23', category: 'Item 1' },
    { count: 3, date: '2023-07-28', category: 'Item 7' },
    { count: 10, date: '2023-08-19', category: 'Item 4' },
    { count: 2, date: '2023-07-20', category: 'Item 3' },
    { count: 10, date: '2023-09-08', category: 'Item 3' },
    { count: 9, date: '2023-07-17', category: 'Item 1' },
    { count: 5, date: '2023-07-27', category: 'Item 3' },
    { count: 3, date: '2023-08-06', category: 'Item 4' },
    { count: 5, date: '2023-09-08', category: 'Item 7' },
    { count: 6, date: '2023-06-09', category: 'Item 3' },
    { count: 4, date: '2023-07-27', category: 'Item 2' },
    { count: 7, date: '2023-09-01', category: 'Item 7' },
    { count: 2, date: '2023-08-08', category: 'Item 3' },
    { count: 4, date: '2023-07-12', category: 'Item 7' },
    { count: 5, date: '2023-07-09', category: 'Item 4' },
    { count: 6, date: '2023-06-14', category: 'Item 7' },
    { count: 2, date: '2023-06-01', category: 'Item 5' },
    { count: 5, date: '2023-06-12', category: 'Item 5' },
    { count: 4, date: '2023-08-06', category: 'Item 5' },
    { count: 10, date: '2023-06-17', category: 'Item 2' },
    { count: 4, date: '2023-07-16', category: 'Item 6' },
    { count: 5, date: '2023-07-08', category: 'Item 1' },
    { count: 4, date: '2023-07-08', category: 'Item 1' },
    { count: 1, date: '2023-06-10', category: 'Item 1' },
    { count: 3, date: '2023-08-09', category: 'Item 4' },
    { count: 10, date: '2023-06-03', category: 'Item 2' },
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
                <BubbleBarChart
                    data={dummyData}
                    countSelector={(item) => item.count}
                    dateSelector={(item) => item.date}
                    categorySelector={(item) => item.category}
                />
                <BubbleBarChart
                    data={dummyDataForWeek}
                    countSelector={(item) => item.count}
                    dateSelector={(item) => item.date}
                    categorySelector={(item) => item.category}
                />
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
