import React from 'react';

import {
    RequestClient,
    methods,
    getPending,
} from '#request';

import {
    QuestionnaireElement,
    BaseQuestionElement,
    AddRequestProps,
    Requests,
} from '#typings';

import QuestionModal from '#qbc/QuestionModal';

type FaramValues = unknown;

interface ComponentProps {
    className?: string;
    value?: BaseQuestionElement;
    questionnaire: QuestionnaireElement;
    onRequestSuccess: (q: BaseQuestionElement[]) => void;
    closeModal: () => void;
}

interface Params {
    questionnaireId: number | undefined;
    body: {
        questions: BaseQuestionElement[];
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
    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
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
            ...(faramValues as BaseQuestionElement),
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
