import React, { useMemo, useCallback } from 'react';
import {
    _cs,
    isDefined,
    randomString,
    mapToList,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import Checkbox from '#rsu/../v2/Input/Checkbox';
import DropZoneTwo from '#rsci/DropZoneTwo';
import ListView from '#rscv/List/ListView';
import DropdownMenu from '#rsca/DropdownMenu';

import {
    BaseQuestionElement,
    LanguageTitle,
    QuestionType,
} from '#types';
import {
    isChoicedQuestionType,
    generateDurationLabel,
    languageOptionsMap,
} from '#entities/questionnaire';

import DropdownButton from '#components/general/DropdownButton';
import TextOutput from '#components/general/TextOutput';
import HighlightableText from '#newComponents/viewer/HighlightableTextOutput';

import AudioIcon from '#resources/img/questionnaire-icons/audio.png';
import BarcodeIcon from '#resources/img/questionnaire-icons/barcode.png';
import DateAndTimeIcon from '#resources/img/questionnaire-icons/date-and-time.png';
import ImageIcon from '#resources/img/questionnaire-icons/image.png';
import LocationIcon from '#resources/img/questionnaire-icons/location.png';
import NumberIcon from '#resources/img/questionnaire-icons/numbers.png';
import RangeIcon from '#resources/img/questionnaire-icons/range.png';
import RankIcon from '#resources/img/questionnaire-icons/rank.png';
import SelectIcon from '#resources/img/questionnaire-icons/select-one.png';
import TextIcon from '#resources/img/questionnaire-icons/text.png';
import FileUploadIcon from '#resources/img/questionnaire-icons/upload.png';
import VideoIcon from '#resources/img/questionnaire-icons/video.png';

import MetaOutput from '../MetaOutput';
import ResponseOutput from './ResponseOutput';

import styles from './styles.scss';

const iconMap: {
    [key in QuestionType]: string;
} = {
    audio: AudioIcon,
    barcode: BarcodeIcon,
    date: DateAndTimeIcon,
    time: DateAndTimeIcon,
    dateTime: DateAndTimeIcon,
    file: FileUploadIcon,
    image: ImageIcon,
    geopoint: LocationIcon,
    geotrace: LocationIcon,
    geoshape: LocationIcon,
    integer: NumberIcon,
    decimal: NumberIcon,
    range: RangeIcon,
    rank: RankIcon,
    select_one: SelectIcon,
    select_multiple: SelectIcon,
    text: TextIcon,
    video: VideoIcon,

    // acknowledge: TriggerAcknowledgeIcon,
    // note: NoteIcon,
    // calculate: NumberIcon,
    // hidden: TextIcon,
};

interface Props<T extends BaseQuestionElement> {
    data: T;
    className?: string;
    onEditButtonClick?: (key: T['id']) => void;
    onCopy?: (data: T) => void;
    onCopyFromDrop?: (data: T, dropKey: T['id']) => void;
    onClone?: (data: T) => void;
    onAddButtonClick?: (key: T['id']) => void;
    onDelete?: (key: T['id']) => void;
    onArchive?: (key: T['id']) => void;
    onUnarchive?: (key: T['id']) => void;
    // framework?: MiniFrameworkElement;
    expanded?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    selected?: boolean;
    copyDisabled?: boolean;
    onSelectChange?: (key: T['id'], value: boolean) => void;
    onExpandChange?: (key: T['id'], value: boolean) => void;
    searchValue: string;
}

interface DropData<T> {
    question: T;
}

const moreTitleKeySelector = (d: LanguageTitle) => d.uniqueKey;

function Question<T extends BaseQuestionElement>(props: Props<T>) {
    const {
        onEditButtonClick,
        onAddButtonClick,
        data,
        onDelete,
        onArchive,
        onUnarchive,
        onCopyFromDrop,
        onCopy,
        onClone,
        selected,
        onSelectChange,
        expanded,
        onExpandChange,
        className,
        readOnly,
        disabled,
        copyDisabled,
        searchValue,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        if (onEditButtonClick) {
            onEditButtonClick(data.id);
        }
    }, [onEditButtonClick, data]);

    const handleAddButtonClick = useCallback(() => {
        if (onAddButtonClick) {
            onAddButtonClick(data.id);
        }
    }, [onAddButtonClick, data]);

    const handleDeleteButtonClick = useCallback(() => {
        if (onDelete) {
            onDelete(data.id);
        }
    }, [onDelete, data]);

    const handleArchiveButtonClick = useCallback(() => {
        if (onArchive) {
            onArchive(data.id);
        }
    }, [data, onArchive]);

    const handleUnarchiveButtonClick = useCallback(() => {
        if (onUnarchive) {
            onUnarchive(data.id);
        }
    }, [data, onUnarchive]);

    const handleQuestionDrop = useCallback((dropData: DropData<T>) => {
        if (onCopyFromDrop) {
            onCopyFromDrop(
                dropData.question,
                data.id,
            );
        }
    }, [onCopyFromDrop, data]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        const dropData = JSON.stringify({
            question: data,
        });
        e.dataTransfer.setData('text/plain', dropData);
        e.dataTransfer.dropEffect = 'copy';
    }, [data]);

    const handleCopy = useCallback(() => {
        if (onCopy) {
            onCopy(data);
        }
    }, [onCopy, data]);

    const handleClone = useCallback(() => {
        if (onClone) {
            onClone(data);
        }
    }, [onClone, data]);

    const handleCheckboxClick = useCallback(() => {
        const {
            id: questionId,
        } = data;

        if (onSelectChange) {
            onSelectChange(questionId, !selected);
        }
    }, [data, onSelectChange, selected]);

    const handleExpandClick = useCallback(() => {
        const { id: questionId } = data;

        if (onExpandChange) {
            onExpandChange(questionId, !expanded);
        }
    }, [onExpandChange, expanded, data]);

    const {
        type,
        title,
        name,
        moreTitles,
        crisisTypeDetail,
        enumeratorSkillDisplay,
        dataCollectionTechniqueDisplay,
        importanceDisplay,
        requiredDuration,
        isArchived,
        attributeTitle,
    } = data;

    const moreTitlesList: LanguageTitle[] = useMemo(() => {
        if (isNotDefined(moreTitles)) {
            return [];
        }
        return mapToList(
            moreTitles,
            (d, k) => {
                const key = String(k);
                return ({
                    uniqueKey: randomString(),
                    title: d,
                    key,
                });
            },
        );
    }, [moreTitles]);

    const moreTitlesRendererParams = useCallback((
        key: LanguageTitle['uniqueKey'],
        titleInfo: LanguageTitle,
    ) => ({
        className: styles.textOutput,
        label: languageOptionsMap[titleInfo.key],
        value: titleInfo.title,
        searchValue,
    }), [searchValue]);

    return (
        <div
            className={_cs(className, styles.questionContainer)}
            draggable={isDefined(onCopy)}
            onDragStart={handleDragStart}
        >
            <div className={styles.topContainer}>
                {onSelectChange && (
                    <Checkbox
                        className={styles.checkbox}
                        checkIconClassName={styles.checkIcon}
                        value={selected}
                        onChange={handleCheckboxClick}
                    />
                )}
                <div className={styles.question}>
                    <div className={styles.brief}>
                        <div className={styles.iconContainer}>
                            <img
                                className={styles.icon}
                                src={(type ? iconMap[type] : undefined)}
                                alt={type}
                            />
                        </div>
                        <div className={styles.detailsContainer}>
                            {onExpandChange && (
                                <Button
                                    className={styles.expandButton}
                                    onClick={handleExpandClick}
                                    iconName={expanded ? 'chevronDown' : 'chevronRight'}
                                    transparent
                                />
                            )}
                            <div className={styles.detailsRight} >
                                <div className={styles.top}>
                                    <div className={styles.left}>
                                        <h3 className={styles.title}>
                                            <HighlightableText
                                                highlightText={searchValue}
                                                text={title}
                                            />
                                        </h3>
                                        <div className={styles.basicInfo}>
                                            <MetaOutput
                                                label="Crisis type"
                                                searchValue={searchValue}
                                                value={crisisTypeDetail
                                                && crisisTypeDetail.title}
                                            />
                                            <MetaOutput
                                                label="Data collection technique"
                                                searchValue={searchValue}
                                                value={dataCollectionTechniqueDisplay}
                                            />
                                            <MetaOutput
                                                label="Enumerator skill"
                                                searchValue={searchValue}
                                                value={enumeratorSkillDisplay}
                                            />
                                            <MetaOutput
                                                label="Required duration"
                                                searchValue={searchValue}
                                                value={generateDurationLabel(requiredDuration)}
                                            />
                                            <MetaOutput
                                                label="Importance"
                                                value={importanceDisplay && `Importance: ${importanceDisplay}`}
                                            />
                                        </div>
                                    </div>
                                    {!readOnly && (
                                        <div className={styles.buttonContainer}>
                                            {(isArchived && onUnarchive) && (
                                                <Button
                                                    onClick={handleUnarchiveButtonClick}
                                                    disabled={disabled}
                                                >
                                                    Unpark Question
                                                </Button>
                                            )}
                                            {onEditButtonClick && (
                                                <WarningButton
                                                    onClick={handleEditButtonClick}
                                                    disabled={disabled}
                                                    transparent
                                                    iconName="edit"
                                                    title="Edit"
                                                />
                                            )}
                                            {((!isArchived && onArchive) || onDelete) && (
                                                <DropdownMenu
                                                    dropdownIcon="menuDots"
                                                    closeOnClick
                                                >
                                                    {(!isArchived && onArchive) && (
                                                        <DropdownButton
                                                            onClick={handleArchiveButtonClick}
                                                            disabled={disabled}
                                                            title="Send to Parking Lot"
                                                        />
                                                    )}
                                                    {onDelete && (
                                                        <DropdownButton
                                                            onClick={handleDeleteButtonClick}
                                                            disabled={disabled}
                                                            title="Delete"
                                                        />
                                                    )}
                                                    {onClone && (
                                                        <DropdownButton
                                                            onClick={handleClone}
                                                            disabled={disabled}
                                                            title="Clone"
                                                        />
                                                    )}
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <MetaOutput
                                    label="Crisis type"
                                    searchValue={searchValue}
                                    value={attributeTitle}
                                    className={styles.frameworkAttribute}
                                />
                            </div>
                        </div>
                    </div>
                    {expanded && (
                        <div className={styles.details}>
                            <div className={styles.enumeratorInstruction}>
                                <h4 className={styles.heading}>
                                    Name
                                </h4>
                                <div className={styles.content}>
                                    {name ? (
                                        <HighlightableText
                                            highlightText={searchValue}
                                            text={name}
                                        />
                                    ) : '-'}
                                </div>
                            </div>
                            {(moreTitlesList.length > 0) && (
                                <div className={styles.moreTitles}>
                                    <h4 className={styles.heading}>
                                        More Titles
                                    </h4>
                                    <ListView
                                        className={styles.content}
                                        data={moreTitlesList}
                                        renderer={TextOutput}
                                        keySelector={moreTitleKeySelector}
                                        rendererParams={moreTitlesRendererParams}
                                    />
                                </div>
                            )}
                            {isChoicedQuestionType(type) && (
                                <div className={styles.responseOptions}>
                                    <h4 className={styles.heading}>
                                        Response options
                                    </h4>
                                    <div className={styles.content}>
                                        <ResponseOutput
                                            type={data.type}
                                            options={data.responseOptions}
                                            searchValue={searchValue}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className={styles.enumeratorInstruction}>
                                <h4 className={styles.heading}>
                                    Enumerator instructions
                                </h4>
                                <div className={styles.content}>
                                    {data.enumeratorInstruction ? (
                                        <HighlightableText
                                            highlightText={searchValue}
                                            text={data.enumeratorInstruction}
                                        />
                                    ) : '-'}
                                </div>
                            </div>
                            <div className={styles.respondentInstruction}>
                                <h4 className={styles.heading}>
                                    Respondent instructions
                                </h4>
                                <div className={styles.content}>
                                    {data.respondentInstruction ? (
                                        <HighlightableText
                                            highlightText={searchValue}
                                            text={data.respondentInstruction}
                                        />
                                    ) : '-'}
                                </div>
                            </div>
                        </div>
                    )}
                    {onCopy && (
                        <Button
                            className={styles.copyButton}
                            onClick={handleCopy}
                            iconName="copyOutline"
                            disabled={disabled || copyDisabled}
                        >
                            Copy
                        </Button>
                    )}
                </div>
            </div>
            {isNotDefined(onCopy) && (
                <div className={styles.dropZoneContainer}>
                    {isDefined(onCopyFromDrop) ? (
                        <DropZoneTwo
                            className={styles.dropZone}
                            onDrop={handleQuestionDrop}
                        />
                    ) : (
                        <div className={styles.dropZone} />
                    )}
                    {isDefined(onAddButtonClick) && (
                        <Button
                            className={styles.addButton}
                            onClick={handleAddButtonClick}
                            iconName="add"
                            disabled={disabled}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

Question.defaultProps = {
    expanded: false,
};

export default Question;
