import React from 'react';

import {
    RequestClient,
    methods,
} from '#request';

import {
    MiniFrameworkElement,
    QuestionnaireElement,
    QuestionnaireQuestionElement,
    AddRequestProps,
    Requests,
} from '#typings';

import QuestionModal from '#qbc/QuestionModal';

type FaramValues = unknown;

interface ComponentProps {
    className?: string;
    questionnaireId: number;
    value?: QuestionnaireQuestionElement;
    framework?: MiniFrameworkElement;
    questionnaire: QuestionnaireElement;
    onRequestSuccess: (q: QuestionnaireQuestionElement) => void;
    closeModal: () => void;
}

interface Params {
    body?: QuestionnaireQuestionElement;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionSaveRequest: {
        url: ({ props: { value, questionnaireId } }) => {
            if (!value || !value.id) {
                return `/questionnaires/${questionnaireId}/questions/`;
            }

            return (`/questionnaires/${questionnaireId}/questions/${value.id}/`);
        },
        method: ({ props: { value } }) => ((value && value.id) ? methods.PATCH : methods.POST),
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
            props.onRequestSuccess(response as QuestionnaireQuestionElement);
        },
    },
};

class QuestionModalForQuestionnaire extends React.PureComponent<Props> {
    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
        const {
            value,
            requests: { questionSaveRequest },
            questionnaireId,
        } = this.props;

        const body = faramValues as QuestionnaireQuestionElement;

        if (value && value.id) {
            questionSaveRequest.do({ body });
        } else {
            questionSaveRequest.do({
                body: {
                    ...body,
                    questionnaire: questionnaireId,
                },
            });
        }
    }

    render() {
        const {
            className,
            closeModal,
            value,
            framework,
            requests: {
                questionSaveRequest: {
                    pending,
                },
            },
        } = this.props;

        return (
            <QuestionModal
                className={className}
                onSuccess={this.handleFaramValidationSuccess}
                closeModal={closeModal}
                pending={pending}
                value={value}
                framework={framework}
            />
        );
    }
}


export default RequestClient(requestOptions)(
    QuestionModalForQuestionnaire,
);
