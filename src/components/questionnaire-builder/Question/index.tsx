import React from 'react';
import memoize from 'memoize-one';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import Checkbox from '#rsu/../v2/Input/Checkbox';
import DropZoneTwo from '#rsci/DropZoneTwo';
import DropdownMenu from '#rsca/DropdownMenu';

import {
    BaseQuestionElement,
    MiniFrameworkElement,
    QuestionType,
} from '#typings';
import {
    isChoicedQuestionType,
    generateDurationLabel,
} from '#entities/questionnaire';

import { getMatrix2dStructures } from '#utils/framework';
import DropdownButton from '#components/general/DropdownButton';
import HighlightableText from '#components/viewer/HighlightableTextOutput';

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
    framework?: MiniFrameworkElement;
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

class Question<T extends BaseQuestionElement> extends React.PureComponent<Props<T>> {
    public static defaultProps = {
        expanded: false,
    };

    private getFrameworkOptions = memoize(getMatrix2dStructures)

    handleEditButtonClick = () => {
        const {
            onEditButtonClick,
            data,
        } = this.props;

        if (onEditButtonClick) {
            onEditButtonClick(data.id);
        }
    }

    handleAddButtonClick = () => {
        const {
            data,
            onAddButtonClick,
        } = this.props;

        if (onAddButtonClick) {
            onAddButtonClick(data.id);
        }
    }

    handleDeleteButtonClick = () => {
        const {
            onDelete,
            data,
        } = this.props;

        if (onDelete) {
            onDelete(data.id);
        }
    }

    handleArchiveButtonClick = () => {
        const {
            onArchive,
            data,
        } = this.props;

        if (onArchive) {
            onArchive(data.id);
        }
    }

    handleUnarchiveButtonClick = () => {
        const {
            onUnarchive,
            data,
        } = this.props;

        if (onUnarchive) {
            onUnarchive(data.id);
        }
    }

    handleQuestionDrop = (dropData: DropData<T>) => {
        const {
            onCopyFromDrop,
            data,
        } = this.props;

        if (onCopyFromDrop) {
            onCopyFromDrop(
                dropData.question,
                data.id,
            );
        }
    }

    handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const {
            data,
        } = this.props;

        const dropData = JSON.stringify({
            question: data,
        });
        e.dataTransfer.setData('text/plain', dropData);
        e.dataTransfer.dropEffect = 'copy';
    }

    handleCopy = () => {
        const {
            onCopy,
            data,
        } = this.props;

        if (onCopy) {
            onCopy(data);
        }
    }

    handleClone = () => {
        const {
            onClone,
            data,
        } = this.props;

        if (onClone) {
            onClone(data);
        }
    }

    handleCheckboxClick = () => {
        const {
            data: {
                id: questionId,
            },
            selected,
            onSelectChange,
        } = this.props;

        if (onSelectChange) {
            onSelectChange(questionId, !selected);
        }
    }

    handleExpandClick = () => {
        const {
            data: {
                id: questionId,
            },
            expanded,
            onExpandChange,
        } = this.props;

        if (onExpandChange) {
            onExpandChange(questionId, !expanded);
        }
    }

    public render() {
        const {
            selected,
            className,
            data,
            readOnly,
            disabled,
            expanded,
            onSelectChange,
            onExpandChange,
            copyDisabled,
            onCopy,

            onArchive,
            onUnarchive,
            onEditButtonClick,
            onDelete,
            onClone,
            onCopyFromDrop,
            onAddButtonClick,

            searchValue,
        } = this.props;

        const {
            type,
            title,
            crisisTypeDetail,
            enumeratorSkillDisplay,
            dataCollectionTechniqueDisplay,
            importanceDisplay,
            requiredDuration,
            isArchived,
            attributeTitle,
        } = data;

        return (
            <div
                className={_cs(className, styles.questionContainer)}
                draggable={isDefined(onCopy)}
                onDragStart={this.handleDragStart}
            >
                <div className={styles.topContainer}>
                    {onSelectChange && (
                        <Checkbox
                            className={styles.checkbox}
                            checkIconClassName={styles.checkIcon}
                            value={selected}
                            onChange={this.handleCheckboxClick}
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
                                        onClick={this.handleExpandClick}
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
                                                        onClick={this.handleUnarchiveButtonClick}
                                                        disabled={disabled}
                                                    >
                                                        Unpark Question
                                                    </Button>
                                                )}
                                                {onEditButtonClick && (
                                                    <WarningButton
                                                        onClick={this.handleEditButtonClick}
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
                                                                onClick={
                                                                    this.handleArchiveButtonClick
                                                                }
                                                                disabled={disabled}
                                                                title="Send to Parking Lot"
                                                            />
                                                        )}
                                                        {onDelete && (
                                                            <DropdownButton
                                                                onClick={
                                                                    this.handleDeleteButtonClick
                                                                }
                                                                disabled={disabled}
                                                                title="Delete"
                                                            />
                                                        )}
                                                        {onClone && (
                                                            <DropdownButton
                                                                onClick={this.handleClone}
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
                                {isChoicedQuestionType(type) && (
                                    <div className={styles.responseOptions}>
                                        <div className={styles.heading}>
                                            Response options
                                        </div>
                                        <div className={styles.content}>
                                            <ResponseOutput
                                                type={data.type}
                                                value={data.responseOptions}
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
                                onClick={this.handleCopy}
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
                                onDrop={this.handleQuestionDrop}
                            />
                        ) : (
                            <div className={styles.dropZone} />
                        )}
                        {isDefined(onAddButtonClick) && (
                            <Button
                                className={styles.addButton}
                                onClick={this.handleAddButtonClick}
                                iconName="add"
                                disabled={disabled}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export default Question;
