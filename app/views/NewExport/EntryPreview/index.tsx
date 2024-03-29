import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    formatDateToString,
} from '@togglecorp/fujs';
import {
    ContainerCard,
    TextOutput,
    List,
    ListView,
} from '@the-deep/deep-ui';
import { BiTargetLock } from 'react-icons/bi';
import { IoEllipse } from 'react-icons/io5';
import { useQuery, gql } from '@apollo/client';

import {
    Widget,
} from '#types/newAnalyticalFramework';
import {
    ExportEnumsQuery,
    ExportDateFormatEnum,
    ExportReportCitationStyleEnum,
} from '#generated/types';

import {
    TreeSelectableWidget,
} from '../types';

import styles from './styles.css';

const EXPORT_ENUMS = gql`
    query ExportEnums {
        enums {
            ExportExtraOptionsSerializerDateFormat {
                description
                enum
                label
            }
            ExportExtraOptionsSerializerReportCitationStyle {
                description
                enum
                label
            }
        }
    }
`;
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

const sampleTexts = [
    'The seaweed is always greener In somebody else\'s lake You dream about going up there But that is a big mistake',
    'Under the sea Under the sea Darling it\'s better Down where it\'s wetter Take it from me Up on the shore they work all day Out in the sun they slave away',
    'Down here all the fish is happy As off through the waves they roll The fish on the land ain\'t happy They sad \'cause they in their bowl',
];

const sampleTimeRange = '12:00 - 14:50';
const sampleTime = '13:52';
const sampleGeo = 'Rivnenska; Bagmati;';

const widgetKeySelector = (widget: Widget) => widget.id;

interface TextWidgetRendererProps {
    title: string;
}

function TextWidgetRenderer(props: TextWidgetRendererProps) {
    const {
        title,
    } = props;

    const selectedText = useMemo(() => (
        sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    ), []);

    return (
        <TextOutput
            className={styles.textWidget}
            labelContainerClassName={styles.label}
            valueContainerClassName={styles.value}
            label={title}
            value={selectedText}
        />
    );
}

const todaysDate = new Date();
const nextYear = todaysDate;
nextYear.setFullYear(todaysDate.getFullYear() + 1);

interface WidgetSampleProps {
    widget: Widget;
    selectedFormat?: { label: string; };
}

function WidgetSample(props: WidgetSampleProps) {
    const {
        widget,
        selectedFormat,
    } = props;

    const sampleDateOne = formatDateToString(todaysDate, selectedFormat?.label ?? 'dd-MM-yyyy');
    const sampleDateTwo = formatDateToString(
        nextYear,
        selectedFormat?.label ?? 'dd-MM-yyyy',
    );

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
            const oneYearLaterDate = new Date(sampleDateOne);
            oneYearLaterDate.setFullYear(oneYearLaterDate.getFullYear() + 1);
            return `${sampleDateOne} - ${sampleDateTwo}`;
        }
        if (widget.widgetId === 'DATE') {
            return sampleDateOne;
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
    }, [widget, sampleDateOne, sampleDateTwo]);

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
    textWidgets: TreeSelectableWidget[];
    showLeadEntryId: boolean;
    showAssessmentData: boolean;
    showEntryWidgetData: boolean;
    dateFormat: ExportDateFormatEnum | undefined;
    citationFormat: ExportReportCitationStyleEnum | undefined;
}

function EntryPreview(props: Props) {
    const {
        className,
        contextualWidgets,
        showLeadEntryId,
        showAssessmentData,
        showEntryWidgetData,
        textWidgets,
        dateFormat,
        citationFormat,
    } = props;

    const {
        data: exportEnums,
    } = useQuery<ExportEnumsQuery>(
        EXPORT_ENUMS,
    );

    const selectedFormat = useMemo(() => {
        const options = exportEnums?.enums?.ExportExtraOptionsSerializerDateFormat ?? [];
        return options.find((item) => item.enum === dateFormat);
    }, [exportEnums, dateFormat]);

    const dateInSelectedFormat = useMemo(() => (
        formatDateToString(new Date(), selectedFormat?.label ?? 'dd-MM-yyyy')
    ), [
        selectedFormat,
    ]);

    const selectedExcerpt = useMemo(() => {
        const excerpt = sampleExcerpts[Math.floor(Math.random() * sampleExcerpts.length)];
        if (citationFormat === 'STYLE_1') {
            return excerpt.replace(/\.$/, '');
        }
        return excerpt;
    }, [citationFormat]);

    const filteredContextualWidgets = useMemo(() => (
        contextualWidgets?.filter((widget) => widget.selected)
    ), [contextualWidgets]);

    const filteredTextWidgets = useMemo(() => (
        textWidgets?.filter((widget) => widget.selected)
    ), [textWidgets]);

    const widgetSampleRendererParams = useCallback((_: string, widget: Widget) => ({
        widget,
        selectedFormat,
    }), [
        selectedFormat,
    ]);

    const textWidgetRendererParams = useCallback((_: string, widget: Widget) => ({
        title: widget.title,
    }), []);

    return (
        <ContainerCard
            className={_cs(className, styles.entryPreview)}
            heading="Entry Structure Preview"
            headingSize="small"
            contentClassName={styles.content}
            borderBelowHeader
        >
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
                        {`, 612 Key Informant Interview, Data collection: ${dateInSelectedFormat}`}
                    </span>
                )}
                {showEntryWidgetData && filteredContextualWidgets?.length > 0 && (
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
                <span className={styles.excerpt}>
                    {selectedExcerpt}
                </span>
                {filteredTextWidgets.length > 0 && (
                    <ListView
                        className={styles.textWidgets}
                        data={filteredTextWidgets}
                        keySelector={widgetKeySelector}
                        renderer={TextWidgetRenderer}
                        rendererParams={textWidgetRendererParams}
                        filtered={false}
                        pending={false}
                        errored={false}
                    />
                )}
                {citationFormat === 'DEFAULT' && (
                    <span className={styles.leadDetails}>
                        (
                        <span className={styles.link}>
                            HarperCollins
                        </span>
                        {`, Moby-Dick, ${dateInSelectedFormat})`}
                    </span>
                )}
                {citationFormat === 'STYLE_1' && (
                    <span className={styles.leadDetails}>
                        (
                        <span className={styles.link}>
                            Moby-Dick
                        </span>
                        {` ${dateInSelectedFormat}).`}
                    </span>
                )}
            </div>
        </ContainerCard>
    );
}

export default EntryPreview;
