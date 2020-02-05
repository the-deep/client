import React from 'react';

import {
    RequestClient,
    methods,
    getPending,
} from '#request';

import {
    BaseQuestionElement,
    AddRequestProps,
    Requests,
    FrameworkElement,
} from '#typings';

import QuestionModal from '#qbc/QuestionModal';

import styles from './styles.scss';

type FaramValues = unknown;
interface FaramErrors {}

interface ComponentProps {
    className?: string;
    value?: BaseQuestionElement;
    framework: FrameworkElement;
    onRequestSuccess: (q: BaseQuestionElement[]) => void;
    closeModal: () => void;
}

interface Params {
    frameworkId: FrameworkElement['id'];
    body: {
        questions: BaseQuestionElement[];
    };
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    frameworkPatchRequest: {
        url: ({ params: { frameworkId } = { frameworkId: undefined } }) => `/analysis-frameworks/${frameworkId}/`,
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
            props.onRequestSuccess((response as FrameworkElement).questions);
        },
    },
};

class QuestionModalForFramework extends React.PureComponent<Props> {
    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
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

        questions.push(faramValues as BaseQuestionElement);

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
            requests,
            value,
            closeModal,
        } = this.props;

        const pending = getPending(requests, 'frameworkPatchRequest');

        return (
            <QuestionModal
                className={className}
                onSuccess={this.handleFaramValidationSuccess}
                closeModal={closeModal}
                framework={framework}
                pending={pending}
                value={value}
            />
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionModalForFramework,
);
