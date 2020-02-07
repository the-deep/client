import React from 'react';

import {
    RequestClient,
    methods,
} from '#request';

import {
    FrameworkQuestionElement,
    AddRequestProps,
    Requests,
    MiniFrameworkElement,
} from '#typings';

import QuestionModal, { FaramValues, FaramErrors } from '#qbc/QuestionModal';

import styles from './styles.scss';

interface Error {
    faramErrors: FaramErrors;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

interface ComponentProps {
    className?: string;
    value?: FrameworkQuestionElement;
    framework: MiniFrameworkElement;
    onRequestSuccess: (q: FrameworkQuestionElement[]) => void;
    closeModal: () => void;
}

interface Params {
    body?: FrameworkQuestionElement;
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
            props.onRequestSuccess((response as MiniFrameworkElement).questions);
        },
        onFailure: ({ error, params }) => {
            if (!params || !params.setFaramErrors) {
                return;
            }
            params.setFaramErrors((error as Error).faramErrors);
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
            faramValues: value || {},
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
        } = this.props;

        const body = faramValues as FrameworkQuestionElement;

        if (value && value.id) {
            questionSaveRequest.do({
                body,
                setFaramErrors: this.handleFaramErrorChange,
            });
        } else {
            questionSaveRequest.do({
                body: {
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
