import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram from '@togglecorp/faram';

import Button from '#rsca/Button';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    RequestCoordinator,
    RequestClient,
    methods,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    QuestionnaireFormElement,
    ProjectElement,
    AddRequestProps,
    Requests,
    QuestionElement,
    BasicElement,
} from '#typings';

import {
    defaultKeySelector,
    defaultLabelSelector,
} from '#constants/dummy';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    projectId: ProjectElement['id'];
    value: QuestionElement;
}

type FaramValues = QuestionnaireFormElement;
interface RequestBody extends FaramValues {
    project: ProjectElement['id'];
    questions: QuestionElement[];
}

type FaramErrors = {
    [key in keyof QuestionnaireFormElement]: string | undefined;
}

interface Params {
    body: RequestBody;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

type Props = AddRequestProps<ComponentProps, Params>;

const questionnaireMetaSchema = {
    fields: {
        title: [],
        crisisType: [],
        enumeratorSkill: [],
        dataCollectionTechnique: [],
        requiredDuration: [],
    },
};

const crisisTypeKeySelector = (d: BasicElement) => d.id;
const crisisTypeLabelSelector = (d: BasicElement) => d.title;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireCreateRequest: {
        url: '/questionnaires/',
        method: methods.POST,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            params,
            response,
        }) => {
            if (!params || !params.onSuccess) {
                return;
            }

            params.onSuccess(response);
        },
    },
    questionnairePatchRequest: {
        url: ({ params }) => {
            if (!params || !params.questionnaireId) {
                return '';
            }

            return `/questionnaires/${params.questionnaireId}/`;
        },
        method: methods.PATCH,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            params,
            response,
        }) => {
            if (!params || !params.onSuccess) {
                return;
            }

            params.onSuccess(response);
        },
    },
    questionnaireOptionsRequest: {
        url: '/questionnaires/options/',
        method: methods.GET,
        onMount: true,
    },
};


class AddQuestionnaireForm extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: props.value ? props.value : {},
            faramErrors: {},
        };
    }

    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
        const {
            projectId,
            requests: {
                questionnaireCreateRequest,
                questionnairePatchRequest,
            },
            value,
            onRequestSuccess,
        } = this.props;

        if (value) {
            questionnairePatchRequest.do({
                questionnaireId: value.id,
                body: faramValues,
                onSuccess: onRequestSuccess,
            });
        } else {
            questionnaireCreateRequest.do({
                body: {
                    project: projectId,
                    questions: [],
                    ...faramValues,
                },
                onSuccess: onRequestSuccess,
            });
        }
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
            requests,
            pending: pendingFromProps,
        } = this.props;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
        } = getResponse(requests, 'questionnaireOptionsRequest');


        const {
            faramValues,
            faramErrors,
        } = this.state;

        const pending = pendingFromProps || isAnyRequestPending(requests);

        return (
            <Faram
                schema={questionnaireMetaSchema}
                className={_cs(className, styles.addQuestionnaireForm)}
                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
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
                    keySelector={crisisTypeKeySelector}
                    labelSelector={crisisTypeLabelSelector}
                />
                <SelectInput
                    options={enumeratorSkillOptionList}
                    faramElementName="enumeratorSkill"
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
                <Button
                    type="submit"
                >
                    Save
                </Button>
            </Faram>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        AddQuestionnaireForm,
    ),
);
