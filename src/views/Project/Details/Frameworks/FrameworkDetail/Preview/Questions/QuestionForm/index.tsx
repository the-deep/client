import React from 'react';
import memoize from 'memoize-one';
import { _cs } from '@togglecorp/fujs';
import Faram from '@togglecorp/faram';

import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import Button from '#rsca/Button';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import { getMatrix2dStructures } from '#utils/framework';
import {
    crisisTypeOptionList,
    dataCollectionTechniqueOptionList,
    enumerationSkillOptionList,
    questionImportanceOptionList,
    defaultKeySelector,
    defaultLabelSelector,
    questionTypeOptionList,
} from '#constants/dummy';

import {
    FrameworkElement,
    QuestionElement,
    Requests,
    AddRequestProps,
} from '#typings';

import ResponseInput from './ResponseInput';
import FrameworkAttributeInput from './FrameworkAttributeInput';


import styles from './styles.scss';

interface ComponentProps {
    framework: FrameworkElement;
    className?: string;
    value?: QuestionElement;
}

interface Params {
    frameworkId: FrameworkElement['id'];
    body: {
        questions: QuestionElement[];
    };
}

interface State {
    faramValues: QuestionElement | undefined;
    faramErrors: {};
}

type Props = AddRequestProps<ComponentProps, Params>;

const schema = {
    fields: {
        title: [],
        type: [],
    },
};

const requests: Requests<ComponentProps, Params> = {
    frameworkPatchRequest: {
        url: ({ params: { frameworkId } = { frameworkId: undefined } }) => `/analysis-frameworks/${frameworkId}/`,
        method: methods.PATCH,
        body: ({ params: { body } = { body: undefined } }) => body,
    },
};

const defaultQuestionValue: QuestionElement = {
    id: undefined,
    frameworkId: undefined,
    responseOptionList: [],
    type: undefined,
    frameworkAttribute: {
        type: 'sector',
    },
};

class QuestionForm extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: props.value
                ? props.value
                : defaultQuestionValue,
            faramErrors: {},
        };
    }

    private getFrameworkOptions = memoize(getMatrix2dStructures)

    private handleFaramChange = (faramValues: QuestionElement) => {
        this.setState({
            faramValues,
        });
    }

    private handleFaramValidationSuccess = (faramValues: QuestionElement) => {
        const {
            framework,
            requests: {
                frameworkPatchRequest,
            },
            value,
        } = this.props;

        const questions = [
            ...framework.questions,
        ];

        if (value && value.id) {
            const currentQuestionIndex = questions.findIndex(d => d.id === value.id);

            if (currentQuestionIndex !== -1) {
                questions.splice(currentQuestionIndex, 1);
            }
        }

        questions.push(faramValues);

        const patchBody = {
            questions,
        };

        frameworkPatchRequest.do({
            frameworkId: framework.id,
            body: patchBody,
        });
    }

    render() {
        const {
            framework,
            className,
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.getFrameworkOptions(framework);

        return (
            <Faram
                className={_cs(className, styles.questionForm)}
                schema={schema}
                onChange={this.handleFaramChange}
                value={faramValues}
                error={faramErrors}
                onValidationSuccess={this.handleFaramValidationSuccess}
            >
                <section className={styles.basic}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            Basic details
                        </h3>
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
                            faramElementName="enumeratorInstructions"
                            className={styles.input}
                            label="Enumerator instructions"
                        />
                        <TextInput
                            faramElementName="respondentInstuctions"
                            className={styles.input}
                            label="Respondent instructions"
                        />
                    </div>
                </section>
                <section className={styles.frameworkDetails}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            Framework
                        </h3>
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
                        <h3 className={styles.heading}>
                            Metadata
                        </h3>
                    </header>
                    <div className={styles.content}>
                        <TextInput
                            className={styles.input}
                            label="Title"
                        />
                        <SelectInput
                            options={crisisTypeOptionList}
                            className={styles.input}
                            label="Crisis type"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <SelectInput
                            options={enumerationSkillOptionList}
                            className={styles.input}
                            label="Enumerator skill"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <SelectInput
                            options={dataCollectionTechniqueOptionList}
                            className={styles.input}
                            label="Data collection technique"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <TextInput
                            className={styles.input}
                            label="Question label"
                        />
                        <SelectInput
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
    RequestClient(requests)(
        QuestionForm,
    ),
);
