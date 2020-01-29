import React from 'react';

import {
    RequestClient,
    methods,
    getPending,
} from '#request';

import {
    QuestionFormElement,
    QuestionnaireElement,
    QuestionElement,
    AddRequestProps,
    Requests,
} from '#typings';

import QuestionModal from '#qbc/QuestionModal';

interface ComponentProps {
    className?: string;
    value?: QuestionElement;
    questionnaire: QuestionnaireElement;
    onRequestSuccess: (q: QuestionElement[]) => void;
    closeModal: () => void;
}

interface Params {
    questionnaireId: number | undefined;
    body: {
        questions: QuestionElement[];
    };
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
        onSuccess: ({
            props,
            response,
        }) => {
            props.onRequestSuccess((response as QuestionnaireElement).questions);
        },
    },
};

class QuestionModalForQuestionnaire extends React.PureComponent<Props> {
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
            requests,
            closeModal,
            value,
        } = this.props;

        const pending = getPending(requests, 'questionnairePatchRequest');

        return (
            <QuestionModal
                className={className}
                onSuccess={this.handleFaramValidationSuccess}
                closeModal={closeModal}
                pending={pending}
                value={value}
            />
        );
    }
}


export default RequestClient(requestOptions)(
    QuestionModalForQuestionnaire,
);
