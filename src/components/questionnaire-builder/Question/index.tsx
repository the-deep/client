import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import {
    BaseQuestionElement,
    MiniFrameworkElement,
    QuestionType,
} from '#typings';
import { getMatrix2dStructures } from '#utils/framework';

import AudioIcon from '#resources/img/questionnaire-icons/audio.png';
import BarcodeIcon from '#resources/img/questionnaire-icons/barcode.png';
import DateAndTimeIcon from '#resources/img/questionnaire-icons/date-and-time.png';
import ImageIcon from '#resources/img/questionnaire-icons/image.png';
import LocationIcon from '#resources/img/questionnaire-icons/location.png';
import NoteIcon from '#resources/img/questionnaire-icons/note.png';
import NumberIcon from '#resources/img/questionnaire-icons/numbers.png';
import PrinterIcon from '#resources/img/questionnaire-icons/printer.png';
import RangeIcon from '#resources/img/questionnaire-icons/range.png';
import RankIcon from '#resources/img/questionnaire-icons/rank.png';
import SelectIcon from '#resources/img/questionnaire-icons/select-one.png';
import SignatureIcon from '#resources/img/questionnaire-icons/signature.png';
import TextIcon from '#resources/img/questionnaire-icons/text.png';
import TriggerAcknowledgeIcon from '#resources/img/questionnaire-icons/trigger-acknowledge.png';
import FileUploadIcon from '#resources/img/questionnaire-icons/upload.png';
import UrlIcon from '#resources/img/questionnaire-icons/url.png';
import VideoIcon from '#resources/img/questionnaire-icons/video.png';

import MetaOutput from '../MetaOutput';
import FrameworkAttributeOutput from './FrameworkAttributeOutput';
import ResponseOutput from './ResponseOutput';
import styles from './styles.scss';

const iconMap: {
    [key in QuestionType]: string;
} = {
    acknowledge: TriggerAcknowledgeIcon,
    audio: AudioIcon,
    barcode: BarcodeIcon,
    dateAndTime: DateAndTimeIcon,
    file: FileUploadIcon,
    image: ImageIcon,
    location: LocationIcon,
    note: NoteIcon,
    number: NumberIcon,
    printer: PrinterIcon,
    range: RangeIcon,
    rank: RankIcon,
    select: SelectIcon,
    signature: SignatureIcon,
    text: TextIcon,
    url: UrlIcon,
    video: VideoIcon,
};

interface Props {
    data: BaseQuestionElement;
    className?: string;
    onEditButtonClick?: (key: BaseQuestionElement['id']) => void;
    framework?: MiniFrameworkElement;
    hideDetails?: boolean;
    readOnly?: boolean;
}

class Question extends React.PureComponent<Props> {
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

    public render() {
        const {
            className,
            data,
            framework,
            readOnly,
            hideDetails,
        } = this.props;

        if (!data) {
            return null;
        }

        const {
            type,
            title,
            crisisTypeDetail,
            enumeratorSkillDisplay,
            dataCollectionTechniqueDisplay,
            importanceDisplay,
            requiredDuration,
        } = data;

        return (
            <div className={_cs(className, styles.question)}>
                <div className={styles.brief}>
                    <div className={styles.left}>
                        <img
                            className={styles.icon}
                            src={type ? iconMap[type] : undefined}
                            alt={type}
                        />
                    </div>
                    <div className={styles.right}>
                        <div className={styles.top}>
                            <div className={styles.left}>
                                <h4 className={styles.heading}>
                                    { title }
                                </h4>
                                <div className={styles.basicInfo}>
                                    <MetaOutput
                                        // FIXME: use strings
                                        label="Crisis type"
                                        value={
                                            crisisTypeDetail ? crisisTypeDetail.title : undefined
                                        }
                                    />
                                    <MetaOutput
                                        // FIXME: use strings
                                        label="Data collection technique"
                                        value={dataCollectionTechniqueDisplay}
                                    />
                                    <MetaOutput
                                        // FIXME: use strings
                                        label="Enumerator skill"
                                        value={enumeratorSkillDisplay}
                                    />
                                    <MetaOutput
                                        // FIXME: use strings
                                        label="Required duration"
                                        value={
                                            requiredDuration
                                                ? `${requiredDuration} min`
                                                : undefined
                                        }
                                    />
                                    <MetaOutput
                                        // FIXME: use strings
                                        label="Importance"
                                        value={
                                            importanceDisplay
                                                ? `Importance: ${importanceDisplay}`
                                                : undefined
                                        }
                                    />
                                </div>
                            </div>
                            {!readOnly && (
                                <div className={styles.right}>
                                    <Button
                                        iconName="delete"
                                        // onClick={this.handleDeleteButtonClick}
                                        disabled
                                    >
                                        {/* FIXME: use strings */}
                                        Delete
                                    </Button>
                                    <Button
                                        iconName="edit"
                                        onClick={this.handleEditButtonClick}
                                    >
                                        {/* FIXME: use strings */}
                                        Edit
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className={styles.bottom}>
                            <FrameworkAttributeOutput
                                className={styles.frameworkAttribute}
                                data={data.frameworkAttribute}
                                {...this.getFrameworkOptions(framework)}
                            />
                        </div>
                    </div>
                </div>
                {!hideDetails && (
                    <div className={styles.details}>
                        {data.type === 'select' && (
                            <div className={styles.responseOptions}>
                                <div className={styles.heading}>
                                    {/* FIXME: use strings */}
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
                            <div className={styles.heading}>
                                {/* FIXME: use strings */}
                                Enumerator instructions
                            </div>
                            <div className={styles.content}>
                                { data.enumeratorInstruction || '-' }
                            </div>
                        </div>
                        <div className={styles.respondentInstruction}>
                            <div className={styles.heading}>
                                {/* FIXME: use strings */}
                                Respondent instructions
                            </div>
                            <div className={styles.content}>
                                { data.respondentInstruction || '-' }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Question;
