import React from 'react';
import { isDefined } from '@togglecorp/fujs';

import {
    RequestClient,
    methods,
} from '#request';

import {
    FrameworkQuestionElement,
    AddRequestProps,
    Requests,
    MiniFrameworkElement,
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

type FrameworkQuestionData = NullableField<FrameworkQuestionElement, 'id' | 'order'>;

interface Error {
    faramErrors: {
        [key: string]: string | undefined;
    };
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

interface ComponentProps {
    className?: string;
    newQuestionOrder?: number;
    value?: FrameworkQuestionData;
    framework: MiniFrameworkElement;
    onRequestSuccess: (q: FrameworkQuestionElement) => void;
    closeModal: () => void;
}

interface Params {
    body?: FrameworkQuestionData & { orderAction?: OrderAction };
    setFaramErrors?: (faramErrors: FaramErrors) => void;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionSaveRequest: {
        url: ({ props: { framework, value } }) => {
            if (!value || !value.id) {
                return `/analysis-frameworks/${framework.id}/questions/`;
            }

            return (`/analysis-frameworks/${framework.id}/questions/${value.id}/`);
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
            props.onRequestSuccess((response as FrameworkQuestionElement));
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

class QuestionModalForFramework extends React.PureComponent<Props, State> {
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
            framework: { id: frameworkId },
            requests: { questionSaveRequest },
            value,
            newQuestionOrder,
        } = this.props;

        const body = transformOut(faramValues) as FrameworkQuestionData;

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
                    analysisFramework: frameworkId,
                },
                setFaramErrors: this.handleFaramErrorChange,
            });
        }
    }

    render() {
        const {
            framework,
            className,
            closeModal,
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
    QuestionModalForFramework,
);
