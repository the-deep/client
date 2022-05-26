import React, { useMemo, useContext, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    List,
    DateOutput,
    Heading,
} from '@the-deep/deep-ui';
import { BiTargetLock } from 'react-icons/bi';
import { IoEllipse } from 'react-icons/io5';
import {
    Widget,
} from '#types/newAnalyticalFramework';

import { ProjectContext } from '#base/context/ProjectContext';

import {
    TreeSelectableWidget,
} from '../../types';

import styles from './styles.css';

const sampleExcerpts = [
    'Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people\'s hats off - then, I account it high time to get to sea as soon as I can.',
    'As for me, I am tormented with an everlasting itch for things remote. I love to sail forbidden seas, and land on barbarous coasts.',
    'Better to sleep with a sober cannibal than a drunk Christian.',
    'There are certain queer times and occasions in this strange mixed affair we call life when a man takes this whole universe for a vast practical joke, though the wit thereof he but dimly discerns, and more than suspects that the joke is at nobody\'s expense but his own.',
    'I cared more for your happiness than your knowing the truth, more for your peace of mind than my plan, more for your life than the lives that might be lost if the plan failed.',
    'But do not despise the lore that has come down from distant years; for oft it may chance that old wives keep in memory word of things that once were needful for the wise to know.',
    'The Quest stands upon the edge of a knife. Stray but a little, and it will fail, to the ruin of all. Yet hope remains while the Company is true.',
    'Consider the subtleness of the sea; how its most dreaded creatures glide under water, unapparent for the most part, and treacherously hidden beneath the loveliest tints of azure. Consider also the devilish brilliance and beauty of many of its most remorseless tribes, as the dainty embellished shape of many species of sharks. Consider, once more, the universal cannibalism of the sea; all whose creatures prey upon each other, carrying on eternal war since the world began.',
    'Human madness is oftentimes a cunning and most feline thing. When you think it fled, it may have but become transfigured into some still subtler form.',
    'It’s a dangerous business, Frodo, going out your door. You step onto the road, and if you don’t keep your feet, there’s no knowing where you might be swept off to.',
];

const sampleDateRange = '08-04-2022 - 20-05-2022';
const sampleTimeRange = '12:00 - 14:50';
const sampleDate = '08-04-2022';
const sampleTime = '13:52';
const sampleGeo = 'Rivnenska; Bagmati;';
const todaysDate = new Date();

const widgetKeySelector = (widget: Widget) => widget.id;

interface WidgetSampleProps {
    widget: Widget;
}

function WidgetSample(props: WidgetSampleProps) {
    const {
        widget,
    } = props;

    const content = useMemo(() => {
        if (widget.widgetId === 'SCALE') {
            const firstItem = widget.properties?.options?.[0];
            if (!firstItem) {
                return undefined;
            }
            return (
                <span className={styles.scale}>
                    <IoEllipse
                        style={{ color: firstItem.color }}
                    />
                    {firstItem.label}
                </span>
            );
        }
        if (widget.widgetId === 'SELECT') {
            const firstItem = widget.properties?.options?.[0];
            if (!firstItem) {
                return undefined;
            }
            return firstItem.label;
        }
        if (widget.widgetId === 'MULTISELECT') {
            const firstItem = widget.properties?.options?.[0];
            if (!firstItem) {
                return undefined;
            }
            return firstItem.label;
        }
        if (widget.widgetId === 'ORGANIGRAM') {
            const firstItem = widget.properties?.options;
            if (!firstItem) {
                return undefined;
            }
            return firstItem.label;
        }
        if (widget.widgetId === 'DATE_RANGE') {
            return sampleDateRange;
        }
        if (widget.widgetId === 'DATE') {
            return sampleDate;
        }
        if (widget.widgetId === 'TIME') {
            return sampleTime;
        }
        if (widget.widgetId === 'TIME_RANGE') {
            return sampleTimeRange;
        }
        if (widget.widgetId === 'GEO') {
            return sampleGeo;
        }
        return undefined;
    }, [widget]);

    if (!content) {
        return null;
    }

    return (
        <span className={styles.widgetSample}>
            {content}
        </span>
    );
}

interface Props {
    className?: string;
    contextualWidgets: TreeSelectableWidget[];
    showLeadEntryId: boolean;
    showAssessmentData: boolean;
    showEntryWidgetData: boolean;
}

function EntryPreview(props: Props) {
    const {
        className,
        contextualWidgets,
        showLeadEntryId,
        showAssessmentData,
        showEntryWidgetData,
    } = props;

    const { project } = useContext(ProjectContext);

    const selectedExcerpt = useMemo(() => (
        sampleExcerpts[Math.floor(Math.random() * sampleExcerpts.length)]
    ), []);
    const filteredContextualWidgets = useMemo(() => (
        contextualWidgets?.filter((widget) => widget.selected)
    ), [contextualWidgets]);

    const widgetSampleRendererParams = useCallback((_, widget: Widget) => ({
        widget,
    }), []);

    return (
        <ContainerCard
            className={_cs(className, styles.entryPreview)}
            heading="Preview"
            headingSize="small"
            contentClassName={styles.content}
            borderBelowHeader
        >
            <Heading
                className={styles.heading}
                size="extraSmall"
            >
                DEEP Export -
                <DateOutput
                    value={todaysDate.toDateString()}
                    format="MMM dd, yyyy"
                />
                {`- ${project?.title}`}
            </Heading>
            <div>
                {showLeadEntryId && (
                    <span className={styles.leadEntryId}>
                        [
                        <span className={styles.number}>89971-118900</span>
                        ]
                    </span>
                )}
                {showAssessmentData && (
                    <span className={styles.assessmentData}>
                        [
                        <BiTargetLock />
                        , 612 Key Informant Interview, Data collection: 2022-04-08 - 2022-04-20]
                    </span>
                )}
                {showEntryWidgetData && (
                    <span className={styles.entryWidgetData}>
                        [
                        <List
                            data={filteredContextualWidgets}
                            keySelector={widgetKeySelector}
                            renderer={WidgetSample}
                            rendererParams={widgetSampleRendererParams}
                        />
                        ]
                    </span>
                )}
                {selectedExcerpt}
                <span className={styles.leadDetails}>
                    (
                    <span className={styles.link}>
                        World Health Organization
                    </span>
                    , Tales of the Sea, 17/04/2022)
                </span>
            </div>
        </ContainerCard>
    );
}

export default EntryPreview;
