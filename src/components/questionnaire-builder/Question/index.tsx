import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';

import {
    QuestionElement,
    FrameworkElement,
    QuestionType,
} from '#typings';
import { getMatrix2dStructures } from '#utils/framework';

import TextIcon from '#resources/img/questionnaire-icons/text.png';
import NumberIcon from '#resources/img/questionnaire-icons/numbers.png';
import SelectIcon from '#resources/img/questionnaire-icons/select one.png';
import DateAndTimeIcon from '#resources/img/questionnaire-icons/date and time.png';
import RankIcon from '#resources/img/questionnaire-icons/rank.png';
import LocationIcon from '#resources/img/questionnaire-icons/location.png';
import ImageIcon from '#resources/img/questionnaire-icons/image.png';
import AudioIcon from '#resources/img/questionnaire-icons/audio.png';
import VideoIcon from '#resources/img/questionnaire-icons/video.png';
import FileUploadIcon from '#resources/img/questionnaire-icons/upload.png';
import BarcodeIcon from '#resources/img/questionnaire-icons/barcode.png';
import RangeIcon from '#resources/img/questionnaire-icons/range.png';

import FrameworkAttributeOutput from './FrameworkAttributeOutput';
import ResponseOutput from './ResponseOutput';
import styles from './styles.scss';

const iconMap: {
    [key in QuestionType]: string;
} = {
    text: TextIcon,
    number: NumberIcon,
    dateAndTime: DateAndTimeIcon,
    select: SelectIcon,
    rank: RankIcon,
    location: LocationIcon,
    image: ImageIcon,
    audio: AudioIcon,
    video: VideoIcon,
    file: FileUploadIcon,
    barcode: BarcodeIcon,
    range: RangeIcon,

    // FIXME: use other icons later
    note: TextIcon,
    url: TextIcon,
    printer: TextIcon,
    acknowledge: TextIcon,
    signature: TextIcon,
};

interface Props {
    data: QuestionElement;
    className?: string;
    onEditButtonClick?: (key: QuestionElement['id']) => void;
    framework: FrameworkElement;
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

        if (!data || !framework) {
            return null;
        }

        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.getFrameworkOptions(framework);

        return (
            <div className={_cs(className, styles.question)}>
                <div className={styles.brief}>
                    <div className={styles.left}>
                        <img
                            className={styles.icon}
                            src={data.type ? iconMap[data.type] : undefined}
                            alt={data.type}
                        />
                    </div>
                    <div className={styles.right}>
                        <div className={styles.top}>
                            <div className={styles.left}>
                                <h4 className={styles.heading}>
                                    { data.title }
                                </h4>
                                <div className={styles.basicInfo}>
                                    {data.crisisTypeDetail && (
                                        <div className={styles.crisisType}>
                                            { data.crisisTypeDetail.title }
                                        </div>
                                    )}
                                    {data.enumeratorSkillDetail && (
                                        <div className={styles.enumeratorSkill}>
                                            { data.enumeratorSkillDetail.value }
                                        </div>
                                    )}
                                    {data.dataCollectionTechniqueDetail && (
                                        <div className={styles.dataCollectionTechnique}>
                                            { data.dataCollectionTechniqueDetail.value }
                                        </div>
                                    )}
                                    {data.importanceDetail && (
                                        <div className={styles.importance}>
                                            <div className={styles.label}>
                                                {/* FIXME: use strings */}
                                                Importance:
                                            </div>
                                            <div className={styles.value}>
                                                { data.importanceDetail.value }
                                            </div>
                                        </div>
                                    )}
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
                                sectorList={sectorList}
                                subsectorList={subsectorList}
                                dimensionList={dimensionList}
                                subdimensionList={subdimensionList}
                                data={data.frameworkAttribute}
                            />
                        </div>
                    </div>
                </div>
                {!hideDetails && (
                    <div className={styles.details}>
                        <div className={styles.labels}>
                            <div className={styles.heading}>
                                {/* FIXME: use strings */}
                                Question labels
                            </div>
                            <div className={styles.content}>
                                -
                            </div>
                        </div>
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
