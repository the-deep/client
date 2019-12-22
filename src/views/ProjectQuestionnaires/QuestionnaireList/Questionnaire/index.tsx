import React from 'react';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';
import { Link } from 'react-router-dom';

import DropdownMenu from '#rsca/DropdownMenu';
import Button from '#rsca/Button';

import { pathNames } from '#constants';
import { QuestionnaireItem } from '#typings';

import {
    crisisTypeOptions,
    dataCollectionTechniqueOptions,
    enumerationSkillOptions,
} from '../../options';

import styles from './styles.scss';

const DropdownButton = ({
    className,
    title,
    ...otherProps
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
    questionnaireKey?: QuestionnaireItem['id'];
    data: QuestionnaireItem;
}

const MetaOutput = ({
    label,
    value,
}) => (
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

class Questionnaire extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            data,
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
                                    { data.numberOfQuestions }
                                </div>
                                <div className={styles.label}>
                                    questions
                                </div>
                            </div>
                            <div className={styles.created}>
                                <div className={styles.label}>
                                    Created on
                                </div>
                                <div className={styles.value}>
                                    { data.dateCreated }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <Link
                            className={styles.editQuestionnaireLink}
                            to={reverseRoute(
                                pathNames.questionnaireBuilder,
                                { questionnaireId: data.id },
                            )}
                        >
                            Edit
                        </Link>
                        <DropdownMenu
                            iconName="moreVertical"
                            hideDropdownIcon
                        >
                            <DropdownButton
                                title="Copy"
                            />
                            <DropdownButton
                                title="Export to KoBo"
                            />
                            <DropdownButton
                                title="Export to ODK"
                            />
                            <DropdownButton
                                title="Export data collection plan"
                            />
                            <DropdownButton
                                title="Archive"
                            />
                        </DropdownMenu>
                    </div>
                </header>
                <div className={styles.content}>
                    <MetaOutput
                        label="Crisis type"
                        value={data.crisisType ? crisisTypeOptions[data.crisisType] : undefined}
                    />
                    <MetaOutput
                        label="Data collection technique"
                        value={data.dataCollectionTechnique ?
                            dataCollectionTechniqueOptions[data.dataCollectionTechnique]
                            : undefined
                        }
                    />
                    <MetaOutput
                        label="Enumerator skill"
                        value={data.enumeratorSkill ?
                            enumerationSkillOptions[data.enumeratorSkill]
                            : undefined
                        }
                    />
                </div>
            </div>
        );
    }
}

export default Questionnaire;
