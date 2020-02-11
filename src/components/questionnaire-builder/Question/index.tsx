import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import Checkbox from '#rsu/../v2/Input/Checkbox';

import {
    BaseQuestionElement,
    MiniFrameworkElement,
    QuestionType,
} from '#typings';
import { getMatrix2dStructures } from '#utils/framework';
import DropdownMenu from '#rsca/DropdownMenu';
import DropdownButton from '#components/general/DropdownButton';

import AudioIcon from '#resources/img/questionnaire-icons/audio.png';
import BarcodeIcon from '#resources/img/questionnaire-icons/barcode.png';
import DateAndTimeIcon from '#resources/img/questionnaire-icons/date-and-time.png';
import ImageIcon from '#resources/img/questionnaire-icons/image.png';
import LocationIcon from '#resources/img/questionnaire-icons/location.png';
// import NoteIcon from '#resources/img/questionnaire-icons/note.png';
import NumberIcon from '#resources/img/questionnaire-icons/numbers.png';
import RangeIcon from '#resources/img/questionnaire-icons/range.png';
import RankIcon from '#resources/img/questionnaire-icons/rank.png';
import SelectIcon from '#resources/img/questionnaire-icons/select-one.png';
import TextIcon from '#resources/img/questionnaire-icons/text.png';
// import TriggerAcknowledgeIcon from '#resources/img/questionnaire-icons/trigger-acknowledge.png';
import FileUploadIcon from '#resources/img/questionnaire-icons/upload.png';
import VideoIcon from '#resources/img/questionnaire-icons/video.png';

import MetaOutput from '../MetaOutput';
import FrameworkAttributeOutput from './FrameworkAttributeOutput';
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

interface Props {
    data: BaseQuestionElement;
    className?: string;
    onEditButtonClick?: (key: BaseQuestionElement['id']) => void;
    onCopy?: (key: BaseQuestionElement['id']) => void;
    onDelete?: (key: BaseQuestionElement['id']) => void;
    onArchive?: (key: BaseQuestionElement['id']) => void;
    onUnarchive?: (key: BaseQuestionElement['id']) => void;
    framework?: MiniFrameworkElement;
    expanded?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    selected?: boolean;
    copyDisabled?: boolean;
    onSelectChange?: (key: BaseQuestionElement['id'], value: boolean) => void;
    onExpandChange?: (key: BaseQuestionElement['id'], value: boolean) => void;
}

class Question extends React.PureComponent<Props> {
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

    handleCopy = () => {
        const {
            onCopy,
            data,
        } = this.props;

        if (onCopy) {
            onCopy(data.id);
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
            framework,
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
        } = data;

        return (
            <div className={_cs(className, styles.questionContainer)}>
                {onSelectChange && (
                    <Checkbox
                        className={styles.checkbox}
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
                                        <h3 className={styles.heading}>
                                            { title }
                                        </h3>
                                        <div className={styles.basicInfo}>
                                            <MetaOutput
                                                label="Crisis type"
                                                value={crisisTypeDetail && crisisTypeDetail.title}
                                            />
                                            <MetaOutput
                                                label="Data collection technique"
                                                value={dataCollectionTechniqueDisplay}
                                            />
                                            <MetaOutput
                                                label="Enumerator skill"
                                                value={enumeratorSkillDisplay}
                                            />
                                            <MetaOutput
                                                label="Required duration"
                                                value={requiredDuration && `${requiredDuration} min`}
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
                                                    Unarchive
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
                                                <DropdownMenu dropdownIcon="menuDots" >
                                                    {(!isArchived && onArchive) && (
                                                        <DropdownButton
                                                            onClick={this.handleArchiveButtonClick}
                                                            disabled={disabled}
                                                            title="Send to Parking Lot"
                                                        />
                                                    )}
                                                    {onDelete && (
                                                        <DropdownButton
                                                            onClick={this.handleDeleteButtonClick}
                                                            disabled={disabled}
                                                            title="Delete"
                                                        />
                                                    )}
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <FrameworkAttributeOutput
                                    className={styles.frameworkAttribute}
                                    data={data.frameworkAttribute}
                                    {...this.getFrameworkOptions(framework)}
                                />
                            </div>
                        </div>
                    </div>
                    {expanded && (
                        <div className={styles.details}>
                            {['select_one', 'select_multiple', 'rank'].includes(data.type) && (
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
                                    { data.enumeratorInstruction || '-' }
                                </div>
                            </div>
                            <div className={styles.respondentInstruction}>
                                <h4 className={styles.heading}>
                                    Respondent instructions
                                </h4>
                                <div className={styles.content}>
                                    { data.respondentInstruction || '-' }
                                </div>
                            </div>
                        </div>
                    )}
                    {onCopy && (
                        <Button
                            className={styles.copyButton}
                            onClick={this.handleCopy}
                            iconName="copyOutline"
                            disabled={copyDisabled}
                        >
                            Copy
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

export default Question;
