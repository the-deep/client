import React from 'react';
import { Link } from 'react-router-dom';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import FormattedDate from '#rscv/FormattedDate';

import { pathNames } from '#constants';
import { QuestionnaireItem } from '#typings';

import styles from './styles.scss';

const MetaOutput = ({
    label,
    value,
}: { label: string; value: string | number | undefined }) => (
    <div className={styles.metaOutput}>
        <div className={styles.label}>
            { label }
        </div>
        <div className={styles.separator}>
            :
        </div>
        <div className={styles.value}>
            { value }
        </div>
    </div>
);

const DropdownButton = ({
    className,
    title,
    ...otherProps
}: {
    className?: string;
    title: string;
    disabled?: boolean;
    onClick?: () => void;
}) => (
    <Button
        className={_cs(className, styles.dropdownButton)}
        transparent
        {...otherProps}
    >
        { title }
    </Button>
);

interface Props {
    className?: string;
    questionnaireKey: QuestionnaireItem['id'];
    data: QuestionnaireItem;
    archived?: boolean;
    disabled?: boolean;
    onArchive: (id: number) => void;
    onUnarchive: (id: number) => void;
}

class Questionnaire extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            data,
            archived,
            questionnaireKey,
            onUnarchive,
            onArchive,
            disabled,
        } = this.props;

        return (
            <div className={_cs(styles.questionnaire, className)}>
                <header className={styles.header}>
                    <div className={styles.left}>
                        <h4 className={styles.heading}>
                            { data.title }
                        </h4>
                        <div className={styles.info}>
                            <div className={styles.questions}>
                                <div className={styles.value}>
                                    { data.questions.length }
                                </div>
                                <div className={styles.label}>
                                    {/* FIXME: use strings */}
                                    questions
                                </div>
                            </div>
                            <div className={styles.created}>
                                <div className={styles.label}>
                                    {/* FIXME: use strings */}
                                    Created on:
                                </div>
                                <div className={styles.value}>
                                    <FormattedDate
                                        value={data.createdAt}
                                        mode="dd-MM-yyyy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        {!archived && (
                            <Link
                                className={styles.editQuestionnaireLink}
                                to={reverseRoute(
                                    pathNames.questionnaireBuilder,
                                    { questionnaireId: data.id },
                                )}
                                disabled={disabled}
                            >
                                {/* FIXME: use strings */}
                                Edit
                            </Link>
                        )}
                        {archived && (
                            <PrimaryButton
                                onClick={() => {
                                    onUnarchive(questionnaireKey);
                                }}
                                disabled={disabled}
                            >
                                {/* FIXME: use strings */}
                                Unarchive
                            </PrimaryButton>
                        )}
                        <DropdownMenu
                            iconName="moreVertical"
                            hideDropdownIcon
                        >
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Copy"
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export to KoBo"
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export to ODK"
                            />
                            <DropdownButton
                                disabled
                                // FIXME: use strings
                                title="Export data collection plan"
                            />
                            {!archived && (
                                <DropdownButton
                                    disabled={disabled}
                                    // FIXME: use strings
                                    title="Archive"
                                    onClick={() => {
                                        onArchive(questionnaireKey);
                                    }}
                                />
                            )}
                        </DropdownMenu>
                    </div>
                </header>
                <div className={styles.content}>
                    <MetaOutput
                        // FIXME: use strings
                        label="Crisis type"
                        value={data.crisisTypeDetail ? data.crisisTypeDetail.title : undefined}
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Data collection technique"
                        value={
                            data.dataCollectionTechniqueDetail
                                ? data.dataCollectionTechniqueDetail.value
                                : undefined
                        }
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Required duration (min)"
                        value={data.requiredDuration}
                    />
                    <MetaOutput
                        // FIXME: use strings
                        label="Enumerator skill"
                        value={
                            data.enumeratorSkillDetail
                                ? data.enumeratorSkillDetail.value
                                : undefined
                        }
                    />
                </div>
            </div>
        );
    }
}

export default Questionnaire;
