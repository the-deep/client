import React from 'react';
import {
    _cs,
    sum,
    isDefined,
} from '@togglecorp/fujs';

import MetaOutput from '#qbc/MetaOutput';
import TextOutput from '#components/general/TextOutput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ProgressBar from '#rsu/../v2/View/ProgressBar';

import {
    IdTitle,
    QuestionnaireQuestionElement,
} from '#types';
import { generateDurationLabel } from '#entities/questionnaire';

import styles from './styles.scss';

// FIXME: Use strings throughout this page

interface Props {
    className?: string;
    frameworkTitle?: string;
    enumeratorSkill?: string;
    // title?: string;
    enumeratorSkillDisplay?: string;
    dataCollectionTechnique?: string;
    dataCollectionTechniquesDisplay?: string[];
    crisisTypesDetail?: IdTitle[];
    showLoadingOverlay: boolean;
    requiredDuration: number;
    questions: QuestionnaireQuestionElement[];
}

class QuestionnaireBuilderDiagnostics extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            questions,
            showLoadingOverlay,
            // title,
            crisisTypesDetail,
            dataCollectionTechniquesDisplay,
            enumeratorSkillDisplay,
            requiredDuration,
            frameworkTitle,
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
                    <h2> Metadata </h2>
                    <div className={styles.metaOutputContainer}>
                        <MetaOutput
                            label="Crisis type"
                            value={
                                crisisTypesDetail
                                    ? crisisTypesDetail.map(c => c.title).join(', ')
                                    : undefined
                            }
                        />
                        <MetaOutput
                            label="Data collection technique"
                            value={dataCollectionTechniquesDisplay
                                ? dataCollectionTechniquesDisplay.join(', ')
                                : undefined}
                        />
                        <MetaOutput
                            label="Enumerator skill"
                            value={enumeratorSkillDisplay}
                        />
                        <MetaOutput
                            label="Required duration"
                            value={generateDurationLabel(requiredDuration)}
                        />
                    </div>
                </header>
                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3> Analysis Framework </h3>
                        <div className={styles.subContent}>
                            {frameworkTitle}
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3> Questions </h3>
                        <div className={styles.subContent}>
                            <TextOutput
                                className={styles.lineItem}
                                label="Selected"
                                value={totalQuestions}
                                type="stretched"
                            />
                            <TextOutput
                                className={styles.lineItem}
                                label="Time Required"
                                value={generateDurationLabel(requiredDuration)}
                                type="stretched"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3> Questionnaire </h3>
                        <div className={styles.subContent}>
                            <TextOutput
                                className={styles.lineItem}
                                label="Theoretic Time"
                                value={generateDurationLabel(requiredDuration)}
                                type="stretched"
                            />
                            <div className={styles.lineItem}>
                                <ProgressBar progress={percent} />
                            </div>
                            <div className={styles.lineItem}>
                                {`Your questionnaire is currently using ${percent}% of the time you determined`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default QuestionnaireBuilderDiagnostics;
