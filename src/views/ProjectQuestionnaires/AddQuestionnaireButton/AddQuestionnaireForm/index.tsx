import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';

import { QuestionnaireMeta } from '#typings';

import {
    crisisTypeOptionList,
    dataCollectionTechniqueOptionList,
    enumerationSkillOptionList,
    defaultKeySelector,
    defaultLabelSelector,
} from '#constants/dummy';

import styles from './styles.scss';

interface Props {
    className?: string;
}

type FaramValues = QuestionnaireMeta;
type FaramErrors = {
    [key in keyof QuestionnaireMeta]: string | undefined;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

const questionnaireMetaSchema = {
    fields: {
        title: [],
        crisisType: [],
        enumeratorSkill: [],
        dataCollectionTechnique: [],
        requiredDuration: [],
    },
};


class AddQuestionnaireForm extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: {},
            faramErrors: {},
        };
    }

    private handleFaramChange = (
        faramValues: FaramValues,
        faramErrors: FaramErrors,
    ) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    public render() {
        const {
            className,
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <Faram
                schema={questionnaireMetaSchema}
                className={_cs(className, styles.addQuestionnaireForm)}
                onChange={this.handleFaramChange}
                value={faramValues}
                error={faramErrors}
            >
                <TextInput
                    faramElementName="title"
                    className={styles.input}
                    label="Title"
                />
                <SelectInput
                    options={crisisTypeOptionList}
                    faramElementName="crisisType"
                    className={styles.input}
                    label="Crisis type"
                    keySelector={defaultKeySelector}
                    labelSelector={defaultLabelSelector}
                />
                <SelectInput
                    options={enumerationSkillOptionList}
                    faramElementName="enumerationSkill"
                    className={styles.input}
                    label="Enumerator skill"
                    keySelector={defaultKeySelector}
                    labelSelector={defaultLabelSelector}
                />
                <SelectInput
                    options={dataCollectionTechniqueOptionList}
                    faramElementName="dataCollectionTechnique"
                    className={styles.input}
                    label="Data collection technique"
                    keySelector={defaultKeySelector}
                    labelSelector={defaultLabelSelector}
                />
                <TextInput
                    faramElementName="requiredDuration"
                    className={styles.input}
                    label="Required duration (Minutes)"
                    type="number"
                />
            </Faram>
        );
    }
}

export default AddQuestionnaireForm;
