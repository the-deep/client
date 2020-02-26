import React from 'react';
import { Form } from 'enketo-core';

import Button from '#rsca/Button';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import {
    AddRequestProps,
    Requests,
    QuestionnaireQuestionElement,
} from '#typings';

import { generateXLSForm } from '#entities/questionnaire';

import styles from './styles.scss';

interface ComponentProps {
    questions: QuestionnaireQuestionElement[];
    questionnaireId: number;
    title: string;
    closeModal?: () => void;
}

interface RequestBody {
}

interface Params {
    body?: RequestBody;
    onFormInit?: (xform: XForm) => void;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    xformExport: {
        url: '/xlsform-to-xform/',
        method: methods.POST,
        body: ({ params }) => params && params.body,
        extras: {
            hasFile: true,
        },
        onSuccess: ({ response, params }) => {
            const xformResponse = response as XForm;
            if (params && params.onFormInit) {
                params.onFormInit(xformResponse);
            }
        },
    },
};

interface XForm {
    form: string;
    model: string;
}

class QuestionnairePreviewModal extends React.PureComponent<Props> {
    public componentDidMount() {
        const {
            questionnaireId,
            title,
            questions,
        } = this.props;

        const selectedQuestions = questions.filter(question => !question.isArchived);

        const workbook = generateXLSForm(
            questionnaireId,
            title,
            selectedQuestions,
        );

        const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        workbook.xlsx.writeBuffer()
            .then((data: BlobPart) => {
                const blob = new Blob(
                    [data],
                    { type },
                );

                this.props.requests.xformExport.do({
                    body: {
                        file: blob,
                    },
                    onFormInit: (xform: XForm) => {
                        setTimeout(
                            () => {
                                const options = {
                                    modelStr: xform.model,
                                };
                                this.form = new Form(
                                    'form.or',
                                    options,
                                );
                                this.form.init();
                            },
                            0,
                        );
                    },
                });
            })
            .catch((ex: unknown) => {
                console.error(ex);
            });
    }

    private getHTML = (xform: XForm) => ({
        __html: xform.form,
    })

    private form: unknown;

    private handleValidate = () => {
        if (!this.form) {
            console.error('Form was not initialized');
            return;
        }

        this.form.validate()
            .then((valid: unknown) => {
                console.warn(valid);
            });
    }

    public render() {
        const {
            requests: {
                xformExport: {
                    pending,
                    response,
                },
            },
            closeModal,
        } = this.props;

        const xformResponse = response as XForm | undefined;

        return (
            <Modal className={styles.questionnairePreviewModal}>
                <ModalHeader
                    // FIXME: use strings
                    title="Preview"
                    rightComponent={
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    }
                />
                <ModalBody className={styles.body}>
                    {pending && <LoadingAnimation />}
                    {xformResponse && (
                        <div
                            className={styles.formContainer}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={this.getHTML(xformResponse)}
                        />
                    )}
                </ModalBody>
                <ModalFooter>
                    {xformResponse && (
                        <PrimaryButton
                            onClick={this.handleValidate}
                        >
                            Validate
                        </PrimaryButton>
                    )}
                    <DangerButton
                        onClick={closeModal}
                    >
                        {/* FIXME: use strings */}
                        Cancel
                    </DangerButton>
                </ModalFooter>
            </Modal>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        QuestionnairePreviewModal,
    ),
);
