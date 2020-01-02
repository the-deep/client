import React from 'react';
import memoize from 'memoize-one';
import Faram from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import Button from '#rsca/Button';

import ResponseInput from '#qbc/ResponseInput';
import FrameworkAttributeInput from '#qbc/FrameworkAttributeInput';

import { getMatrix2dStructures } from '#utils/framework';

import {
    RequestCoordinator,
    RequestClient,
    methods,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    FrameworkElement,
    QuestionFormElement,
    AddRequestProps,
    Requests,
} from '#typings';

import styles from './styles.scss';

type FaramValues = QuestionFormElement;
interface FaramErrors {}

interface ComponentProps {
    className?: string;
    framework: FrameworkElement;
    faramValues: FaramValues;
    faramErrors: FaramErrors;
    onValidationSuccess: (faramValues: FaramValues) => void;
    onChange: (faramValues: FaramValues, faramError: FaramErrors) => void;
}

interface Params {
}

type Props = AddRequestProps<ComponentProps, Params>;

const schema = {
    fields: {
        title: [],
        type: [],
        enumeratorInstruction: [],
        respondentInstruction: [],
        frameworkAttribute: [],
        crisisType: [],
        enumeratorSkill: [],
        dataCollectionTechnique: [],
        importance: [],
    },
};

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireOptionsRequest: {
        url: '/questionnaires/options/',
        method: methods.GET,
        onMount: true,
    },
};

const crisisTypeKeySelector = d => d.id;
const crisisTypeLabelSelector = d => d.title;

const defaultKeySelector = d => d.key;
const defaultLabelSelector = d => d.value;

class QuestionForm extends React.PureComponent<Props> {
    private getFrameworkOptions = memoize(getMatrix2dStructures)

    render() {
        const {
            framework,
            faramValues,
            faramErrors,
            className,
            onChange,
            onValidationSuccess,
            requests,
        } = this.props;

        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.getFrameworkOptions(framework);

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
            questionTypeOptions: questionTypeOptionList,
            questionImportanceOptions: questionImportanceOptionList,
        } = getResponse(requests, 'questionnaireOptionsRequest');

        const pending = isAnyRequestPending(requests);

        return (
            <Faram
                className={_cs(className, styles.questionForm)}
                schema={schema}
                onChange={onChange}
                value={faramValues}
                error={faramErrors}
                onValidationSuccess={onValidationSuccess}
                disabled={pending}
            >
                <section className={styles.basic}>
                    <header className={styles.header}>
                        <h4 className={styles.heading}>
                            Basic details
                        </h4>
                    </header>
                    <div className={styles.content}>
                        <TextInput
                            faramElementName="title"
                            className={styles.input}
                            label="Title"
                        />
                        <ResponseInput
                            faramElementName="responseOptions"
                            className={styles.input}
                            label="Response options"
                        />
                        <SelectInput
                            options={questionTypeOptionList}
                            faramElementName="type"
                            className={styles.input}
                            label="Type"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <TextInput
                            faramElementName="enumeratorInstruction"
                            className={styles.input}
                            label="Enumerator instructions"
                        />
                        <TextInput
                            faramElementName="respondentInstuction"
                            className={styles.input}
                            label="Respondent instructions"
                        />
                    </div>
                </section>
                <section className={styles.frameworkDetails}>
                    <header className={styles.header}>
                        <h4 className={styles.heading}>
                            Framework
                        </h4>
                    </header>
                    <div className={styles.content}>
                        <FrameworkAttributeInput
                            faramElementName="frameworkAttribute"
                            sectorList={sectorList}
                            subsectorList={subsectorList}
                            dimensionList={dimensionList}
                            subdimensionList={subdimensionList}
                        />
                    </div>
                </section>
                <section className={styles.metadata}>
                    <header className={styles.header}>
                        <h4 className={styles.heading}>
                            Metadata
                        </h4>
                    </header>
                    <div className={styles.content}>
                        <SelectInput
                            faramElementName="crisisType"
                            options={crisisTypeOptionList}
                            className={styles.input}
                            label="Crisis type"
                            keySelector={crisisTypeKeySelector}
                            labelSelector={crisisTypeLabelSelector}
                        />
                        <SelectInput
                            faramElementName="enumeratorSkill"
                            options={enumeratorSkillOptionList}
                            className={styles.input}
                            label="Enumerator skill"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <SelectInput
                            faramElementName="dataCollectionTechnique"
                            options={dataCollectionTechniqueOptionList}
                            className={styles.input}
                            label="Data collection technique"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <SelectInput
                            faramElementName="importance"
                            className={styles.input}
                            options={questionImportanceOptionList}
                            label="Question importance"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                    </div>
                </section>
                <Button type="submit">
                    Save
                </Button>
            </Faram>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        QuestionForm,
    ),
);
