import React from 'react';

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
    FrameworkElement,
} from '#typings';

import QuestionForm from '#qbc/QuestionForm';


import styles from './styles.scss';

type FaramValues = QuestionFormElement;
interface FaramErrors {}

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
    faramValues: FaramValues;
    faramErrors: FaramErrors;
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

const defaultQuestionValue: QuestionFormElement = {
    responseOptionList: [],
    frameworkAttribute: {
        type: 'sector',
    },
};

class FrameworkQuestionForm extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: props.value
                ? props.value
                : defaultQuestionValue,
            faramErrors: {},
        };
    }

    private handleFaramChange = (faramValues: FaramValues) => {
        this.setState({
            faramValues,
        });
    }

    private handleFaramValidationSuccess = (faramValues: QuestionFormElement) => {
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

        return (
            <QuestionForm
                className={className}
                schema={schema}
                onChange={this.handleFaramChange}
                faramValues={faramValues}
                faramErrors={faramErrors}
                onValidationSuccess={this.handleFaramValidationSuccess}
                framework={framework}
            />
        );
    }
}

export default RequestCoordinator(
    RequestClient(requests)(
        FrameworkQuestionForm,
    ),
);
