import React, { useState } from 'react';

import ListView from '#rsu/../v2/View/ListView';
import FormattedDate from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';
import Pager from '#rscv/Pager';
import Button from '#rsca/Button';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import {
    ProjectElement,
    MultiResponse,
} from '#typings';

import _ts from '#ts';

import styles from './styles.scss';

interface Assignment {
    id: number;
    createdAt: string;
    projectDetails: ProjectElement;
    createdByDetails: {
        id: number;
        displayName: string;
        email: string;
    };
    contentObjectDetails: {
        id: number;
        title: string;
    };
    isDone: boolean;
    contentObjectType: {
        id: number;
        title: string;
    };
}

interface Data {
    key: number;
    assignee: string;
    sourceTitle: string;
    sourceURL: string;
    projectName: string;
    date: string;
}

interface Props {
}

const data = [
    {
        key: 1,
        assignee: 'Ewan',
        sourceTitle: '150 Somalia Migrants....',
        sourceURL: '#',
        projectName: 'Chilli',
        date: '2020-07-06T22:00:00',
    },
    {
        key: 2,
        assignee: 'Aditya',
        sourceTitle: 'Red Cross rescues....',
        sourceURL: '#',
        projectName: 'Burger',
        date: '2020-07-06T22:00:00',
    },
    {
        key: 3,
        assignee: 'Sameer',
        sourceTitle: 'Poverty in Israel....',
        sourceURL: '#',
        projectName: 'Pizza',
        date: '2020-07-06T22:00:00',
    },
    {
        key: 4,
        assignee: 'Aditya',
        sourceTitle: 'Red Cross rescues....',
        sourceURL: '#',
        projectName: 'Burger',
        date: '2020-07-06T22:00:00',
    },
    {
        key: 5,
        assignee: 'Sameer',
        sourceTitle: 'Poverty in Israel....',
        sourceURL: '#',
        projectName: 'Pizza',
        date: '2020-07-06T22:00:00',
    },


];

const emptyLink = '#';
const maxItemsPerPage = 5;

function assignmentRenderer(info: Assignment) {
    console.warn('info', info);
    return (
        <div className={styles.assignmentItem}>
            <a
                className={styles.link}
                href={emptyLink}
            >
                {info.createdByDetails.displayName}
            </a>
            <span> assigned you</span>
            <a
                className={styles.link}
                href={emptyLink}
            >
                {info.contentObjectDetails?.title}
            </a>
            <span> in </span>
            <a
                href={emptyLink}
                className={styles.link}
            >
                {info.projectDetails.title}
            </a>
            <div className={styles.inline}>
                <FormattedDate
                    className={styles.date}
                    date={info.createdAt}
                    mode="hh:mm aaa, MMM dd, yyyy"
                />
                <Button
                    transparent
                    iconName="checkCircle"
                    className={styles.icon}
                    // onClick={handleClick}
                />
            </div>
        </div>
    );
}

const keySelector = (info: Assignment) => info.id;

const rendererParams = (id: number, info: Assignment) => info;

function Assignments(props: Props) {
    const [activePage, setActivePage] = useState<number>(1);
    const [assignmentCount, setAssignmentCount] = useState<number>(0);
    const [
        pending,
        response,
    ] = useRequest<MultiResponse<Assignment>>({
        url: 'server://assignments/',
        method: 'GET',
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        autoTrigger: true,
        onSuccess: () => {
            setAssignmentCount(response?.count);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('home', 'summaryOfMyProjectsHeading'))({ error: errorBody }),
    });
    console.warn('response', response);
    return (
        <div className={styles.assignment}>
            <header className={styles.header}>
                <h2 className={styles.heading}>
                    My Assignments
                </h2>
            </header>
            <div className={styles.content}>
                <div className={styles.contentContainer}>
                    <ListView
                        data={response?.results}
                        keySelector={keySelector}
                        renderer={assignmentRenderer}
                        rendererParams={rendererParams}
                    />
                    <Pager
                        activePage={activePage}
                        className={styles.pager}
                        itemsCount={assignmentCount}
                        maxItemsPerPage={maxItemsPerPage}
                        onPageClick={setActivePage}
                        showItemsPerPageChange={false}
                    />
                </div>
            </div>
        </div>
    );
}

export default Assignments;
