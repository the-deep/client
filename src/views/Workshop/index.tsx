import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LabelList,
} from 'recharts';

import Icon from '#rscg/Icon';
import Tag from '#dui/Tag';

import Container from '#components/ui/Container';
import Card from '#components/ui/Card';
import Button from '#components/ui/Button';
import QuickActionButton from '#components/ui/QuickActionButton';
import QuickActionLink from '#components/ui/QuickActionLink';
import ButtonLikeLink from '#components/ui/ButtonLikeLink';
import Link from '#components/ui/Link';
import TextArea from '#components/ui/TextArea';
import Timeline from '#components/viz/Timeline';
import { shortMonthNamesMap } from '#utils/common';

import styles from './styles.scss';

const chartData = [
    {
        name: 'Pillar 1',
        value: 40,
    },
    {
        name: 'Pillar 2',
        value: 30,
    },
    {
        name: 'Pillar 3',
        value: 20,
    },
    {
        name: 'Pillar 4',
        value: 27,
    },
    {
        name: 'Pillar 5',
        value: 18,
    },
];

const renderCustomizedLabel = (props: {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
}) => {
    const { x, y, width, value } = props;
    const radius = 10;

    return (
        <g>
            <text
                x={x + (width / 2)}
                y={y - radius}
                fill="#313131"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {value}%
            </text>
        </g>
    );
};

function useInputValue(initialValue: string | undefined): [
    string | undefined,
    (v: string | undefined, n: string | undefined, e: React.FormEvent<HTMLTextAreaElement>) => void
] {
    const [value, setValue] = React.useState<string | undefined>(initialValue);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const setInputValue = React.useCallback((newValue: string | undefined, name, e) => {
        setValue(newValue);
    }, [setValue]);

    return [value, setInputValue];
}

interface TimelineItem {
    label: string;
    value: number;
}

const data: TimelineItem[] = [
    {
        label: 'Analysis 1 - Syria',
        value: new Date('2021-10-12').getTime(),
    },
    {
        label: 'Analysis 2 - Syria',
        value: new Date('2021-12-12').getTime(),
    },
    {
        label: 'Analysis 3 - Syria',
        value: new Date('2022-04-10').getTime(),
    },
];

const labelSelector = (d: TimelineItem) => d.label;
const valueSelector = (d: TimelineItem) => d.value;
const keySelector = (d: TimelineItem) => d.label;
const tickLabelSelector = (d: number) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = date.getMonth();

    return `${year}-${shortMonthNamesMap[month]}`;
};

interface WorkshopProps {
    className?: string;
}

function Workshop(props: WorkshopProps) {
    const {
        className,
    } = props;

    const [textAreaValue, setTextAreaValue] = useInputValue('');

    return (
        <div className={_cs(styles.workshop, className)}>
            <Container heading="Timeline">
                <Timeline
                    data={data}
                    labelSelector={labelSelector}
                    valueSelector={valueSelector}
                    keySelector={keySelector}
                    tickLabelSelector={tickLabelSelector}
                />
            </Container>
            <Container
                heading="Buttons"
                contentClassName={styles.newButtons}
            >
                <Button
                    icons={(
                        <Icon name="add" />
                    )}
                >
                    Primary / Default button
                </Button>
                <Button big>
                    Default button big
                </Button>
                <Button disabled>
                    Disabled button
                </Button>
                <Button variant="secondary" >
                    Seconadry button
                </Button>
                <Button variant="secondary" disabled>
                    Disabled secondary button
                </Button>
                <Button variant="tertiary" >
                    Tertiary button
                </Button>
                <Button variant="tertiary" disabled>
                    Disabled tertiary button
                </Button>
            </Container>
            <Container
                heading="Link"
                contentClassName={styles.links}
            >
                <Link to="/">
                    Go to home
                </Link>
                <Link to="https://togglecorp.com">
                    Go to Togglecorp website
                </Link>
            </Container>
            <Container
                heading="Button like link"
                contentClassName={styles.buttonLikeLinks}
            >
                <ButtonLikeLink to="/">
                    Add new project
                </ButtonLikeLink>
                <ButtonLikeLink
                    to="/"
                    icons={(
                        <Icon name="add" />
                    )}
                >
                    Create new lead
                </ButtonLikeLink>
            </Container>
            <Container
                heading="Tags"
                contentClassName={styles.tags}

            >
                <Tag>
                    Environment
                </Tag>
                <Tag variant="complement1">
                    Socio-Cultural
                </Tag>
                <Tag variant="complement2">
                    Tagged
                </Tag>
                <Tag variant="gradient1">
                    Water
                </Tag>
                <Tag
                    variant="gradient2"
                    icons={(
                        <Icon name="globe" />
                    )}
                >
                    Earth
                </Tag>
                <Tag variant="gradient3">
                    Fire
                </Tag>
                <Tag variant="gradient4">
                    River
                </Tag>
                <Tag
                    variant="accent"
                    actions={(
                        <Icon name="add" />
                    )}
                >
                    Nepal
                </Tag>
            </Container>
            <Container
                heading="input"
                contentClassName={styles.inputs}
            >
                <Card>
                    <TextArea
                        label="Textarea"
                        value={textAreaValue}
                        onChange={setTextAreaValue}
                    />
                </Card>
                <TextArea
                    label="Textarea"
                    value={textAreaValue}
                    onChange={setTextAreaValue}
                    disabled
                />
            </Container>
            <Container
                heading="Quick Action Button"
                sub
                contentClassName={styles.quickActionButtons}
            >
                <QuickActionButton>
                    <Icon name="add" />
                </QuickActionButton>
                <QuickActionButton>
                    <Icon name="edit" />
                </QuickActionButton>
                <QuickActionButton>
                    <Icon name="delete" />
                </QuickActionButton>
            </Container>
            <Container
                heading="Quick Action Link"
                sub
                contentClassName={styles.quickActionButtons}
            >
                <QuickActionLink
                    to="/"
                >
                    <Icon name="add" />
                </QuickActionLink>
                <QuickActionLink
                    to="https://togglecorp.com"
                >
                    <Icon name="openLink" />
                </QuickActionLink>
            </Container>
            <Container
                heading="Rechart with background"

            >
                <div className="chart-container">
                    <BarChart
                        width={400}
                        height={300}
                        data={chartData}
                        barSize={20}
                    >
                        <XAxis dataKey="name" />
                        <YAxis dataKey="value" domain={[0, 100]} />
                        <Bar
                            dataKey="value"
                            fill="#8884d8"
                            background={{ fill: '#eee' }}
                        >
                            <LabelList
                                dataKey="value"
                                content={renderCustomizedLabel}
                            />
                        </Bar>
                    </BarChart>
                </div>
            </Container>
        </div>
    );
}

export default Workshop;
