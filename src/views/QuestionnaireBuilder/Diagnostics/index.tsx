import React from 'react';
import {
    _cs,
    sum,
    isDefined,
} from '@togglecorp/fujs';

import MetaOutput from '#qbc/MetaOutput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ProgressBar from '#rsu/../v2/View/ProgressBar';

import {
    IdTitle,
    QuestionnaireQuestionElement,
} from '#typings';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    enumeratorSkill?: string;
    title?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechnique?: string;
    dataCollectionTechniqueDisplay?: string;
    crisisTypeDetail?: IdTitle;
    showLoadingOverlay: boolean;
    requiredDuration: number;
    questions: QuestionnaireQuestionElement[];
}

type Props = ComponentProps;

class QuestionnaireBuilderDiagnostics extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            questions,
            showLoadingOverlay,
            title,
            crisisTypeDetail,
            dataCollectionTechniqueDisplay,
            enumeratorSkillDisplay,
            requiredDuration,
        } = this.props;

        const selectedQuestions = questions.filter(question => !question.isArchived);

        const totalQuestions = selectedQuestions.length;

        const totalTimeRequired = sum(
            selectedQuestions
                .map(question => question.requiredDuration)
                .filter(isDefined),
        );

        const percent = Math.round(100 * (totalTimeRequired / requiredDuration));

        return (
            <div className={_cs(styles.diagnostics, className)}>
                {showLoadingOverlay && <LoadingAnimation />}
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {title}
                    </h3>
                </header>
                <div className={styles.content}>
                    <div>
                        <MetaOutput
                            // FIXME: use strings
                            label="Crisis type"
                            value={
                                crisisTypeDetail
                                    ? crisisTypeDetail.title
                                    : undefined
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
                    </div>
                    {/* FIXME: use strings */}
                    <h4>
                        Questions
                    </h4>
                    <div>
                        <div>Selected</div>
                        <div>{totalQuestions}</div>
                        <div>Time Required</div>
                        <div>{`${totalTimeRequired} min`}</div>
                    </div>
                    <h4>
                        Questionnaire
                    </h4>
                    <div>
                        <div>Theoretic Time</div>
                        <div>{`${requiredDuration} min`}</div>
                    </div>
                    <ProgressBar progress={percent} />
                    <div>
                        {`Your questionnaire is currently using ${percent}% of the time you determined`}
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionnaireBuilderDiagnostics;
