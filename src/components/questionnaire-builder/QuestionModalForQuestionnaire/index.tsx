import React from 'react';
import { isDefined } from '@togglecorp/fujs';

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
    OrderAction,
    NullableField,
} from '#types';

import QuestionModal, {
    FaramValues,
    FaramErrors,
    transformIn,
    transformOut,
    errorTransformIn,
} from '#qbc/QuestionModal';

type QuestionnaireQuestionData = NullableField<QuestionnaireQuestionElement, 'id' | 'order'>;

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
    value?: QuestionnaireQuestionData;
    framework?: MiniFrameworkElement;
    newQuestionOrder?: number;
    questionnaire: QuestionnaireElement;
    onRequestSuccess: (q: QuestionnaireQuestionElement) => void;
    closeModal: () => void;
}

interface Params {
    body?: QuestionnaireQuestionData & { orderAction?: OrderAction };
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
            newQuestionOrder,
        } = this.props;

        const body = transformOut(faramValues) as QuestionnaireQuestionData;

        if (value && value.id) {
            questionSaveRequest.do({
                body,
                setFaramErrors: this.handleFaramErrorChange,
            });
        } else {
            questionSaveRequest.do({
                body: {
                    orderAction: {
                        action: isDefined(newQuestionOrder) ? 'below' : 'top',
                        value: newQuestionOrder,
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
