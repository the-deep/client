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

import QuestionModal, {
    FaramValues,
    FaramErrors,
    transformIn,
    transformOut,
    errorTransformIn,
} from '#qbc/QuestionModal';

interface Error {
    faramErrors: FaramErrors;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

interface ComponentProps {
    className?: string;
    questionnaireId: number;
    value?: QuestionnaireQuestionElement;
    framework?: MiniFrameworkElement;
    newQuestionOrder?: number;
    questionnaire: QuestionnaireElement;
    onRequestSuccess: (q: QuestionnaireQuestionElement) => void;
    closeModal: () => void;
}

interface OrderAction {
    action: 'top' | 'bottom' | 'above' | 'below';
    value?: number;
}

interface Params {
    body?: QuestionnaireQuestionElement & { orderAction?: OrderAction };
    setFaramErrors?: (faramErrors: FaramErrors) => void;
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
        onFailure: ({ error, params }) => {
            if (!params || !params.setFaramErrors) {
                return;
            }
            params.setFaramErrors(errorTransformIn((error as Error).faramErrors));
        },
        onFatal: ({ params }) => {
            if (!params || !params.setFaramErrors) {
                return;
            }
            params.setFaramErrors({ $internal: ['Some error ocurred!'] });
        },
    },
};

class QuestionModalForQuestionnaire extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        const { value } = this.props;
        this.state = {
            faramValues: transformIn(value),
            faramErrors: {},
        };
    }

    private handleFaramValueChange = (faramValues: FaramValues, faramErrors: FaramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    private handleFaramErrorChange = (faramErrors: FaramErrors) => {
        this.setState({ faramErrors });
    }

    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
        const {
            value,
            requests: { questionSaveRequest },
            questionnaireId,
        } = this.props;

        const body = transformOut(faramValues) as QuestionnaireQuestionElement;

        if (value && value.id) {
            questionSaveRequest.do({
                body,
                setFaramErrors: this.handleFaramErrorChange,
            });
        } else {
            questionSaveRequest.do({
                body: {
                    orderAction: {
                        action: 'top',
                    },
                    ...body,
                    questionnaire: questionnaireId,
                },
                setFaramErrors: this.handleFaramErrorChange,
            });
        }
    }

    render() {
        const {
            className,
            closeModal,
            framework,
            requests: {
                questionSaveRequest: {
                    pending,
                },
            },
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        return (
            <QuestionModal
                className={className}
                closeModal={closeModal}
                pending={pending}
                framework={framework}
                value={faramValues}
                error={faramErrors}
                onSuccess={this.handleFaramValidationSuccess}
                onValueChange={this.handleFaramValueChange}
                onErrorChange={this.handleFaramErrorChange}
            />
        );
    }
}


export default RequestClient(requestOptions)(
    QuestionModalForQuestionnaire,
);
