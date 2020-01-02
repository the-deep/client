import React from 'react';
// import { _cs } from '@togglecorp/fujs';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import {
    QuestionFormElement,
    QuestionnaireElement,
    QuestionElement,
    AddRequestProps,
    Requests,
} from '#typings';

import QuestionForm from '#qbc/QuestionForm';

type FaramValues = QuestionFormElement;
interface FaramErrors {}

interface ComponentProps {
    className?: string;
    value?: QuestionElement;
    questionnaire: QuestionnaireElement;
}

interface Params {
    questionnaireId: number | undefined;
    body: {
        questions: QuestionElement[];
    };
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnairePatchRequest: {
        url: ({ params }) => {
            if (!params || !params.questionnaireId) {
                return '';
            }

            return `/questionnaires/${params.questionnaireId}/`;
        },
        method: methods.PATCH,
        body: ({ params }) => {
            if (!params || !params.body) {
                return {};
            }

            return params.body;
        },
    },
};

const defaultQuestionValue: QuestionFormElement = {
    responseOptionList: [],
    frameworkAttribute: {
        type: 'sector',
    },
};

class QuestionnaireQuestionForm extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: props.value
                ? props.value
                : defaultQuestionValue,
            faramErrors: {},
        };
    }

    private handleFaramChange = (faramValues: FaramValues, faramErrors: FaramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    private handleFaramValidationSuccess = (faramValues: QuestionFormElement) => {
        const {
            questionnaire,
            requests: {
                questionnairePatchRequest,
            },
            value,
        } = this.props;

        const questions = [
            ...questionnaire.questions,
        ];

        if (value && value.id) {
            const currentQuestionIndex = questions.findIndex(d => d.id === value.id);

            if (currentQuestionIndex !== -1) {
                questions.splice(currentQuestionIndex, 1);
            }
        }

        questions.push({
            ...value,
            ...(faramValues as QuestionElement),
        });

        const patchBody = {
            questions,
        };

        questionnairePatchRequest.do({
            questionnaireId: questionnaire.id,
            body: patchBody,
        });
    }

    render() {
        const {
            className,
            questionnaire,
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <QuestionForm
                className={className}
                faramValues={faramValues}
                faramErrors={faramErrors}
                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                framework={questionnaire.projectFrameworkDetail}
            />
        );
    }
}


export default RequestCoordinator(
    RequestClient(requestOptions)(
        QuestionnaireQuestionForm,
    ),
);
