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
import notify from '#notify';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import {
    QuestionnaireElement,
    AddRequestProps,
    Requests,
} from '#types';

import { generateXLSForm } from '#entities/questionnaire';

import styles from './styles.scss';

interface ComponentProps {
    questionnaireId: number;
    title: string;
    closeModal?: () => void;
}

interface RequestBody {
}

interface Params {
    body?: RequestBody;
    onFormInit?: (xform: XForm) => void;
    onQuestionnaireGet?: (questionnaire: QuestionnaireElement) => void;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireGetRequest: {
        url: ({ props: { questionnaireId } }) => `/questionnaires/${questionnaireId}/`,
        onMount: true,
        method: methods.GET,
        onPropsChanged: ['questionnaireId'],
        onSuccess: ({ params, response }) => {
            if (!params || !params.onQuestionnaireGet) {
                return;
            }
            const questionnaire = response as QuestionnaireElement;
            params.onQuestionnaireGet(questionnaire);
        },
        onFailure: notifyOnFailure('Questionnaire'),
        onFatal: notifyOnFatal('Questionnaire'),
    },
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
        // FIXME: handle error if available
        onFailure: notifyOnFailure('Enketo preview'),
        onFatal: notifyOnFatal('Enketo preview'),
    },
};

interface XForm {
    form: string;
    model: string;
}

class QuestionnairePreviewModal extends React.PureComponent<Props> {
    public constructor(props: Props) {
        super(props);

        const {
            requests: {
                questionnaireGetRequest,
            },
        } = this.props;

        questionnaireGetRequest.setDefaultParams({
            onQuestionnaireGet: this.onQuestionnaireGet,
        });
    }

    private onQuestionnaireGet = (questionnaire: QuestionnaireElement) => {
        const {
            questionnaireId,
            title,
        } = this.props;

        const {
            questions,
        } = questionnaire;

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
                notify.send({
                    title: 'Enketo preview',
                    type: notify.type.ERROR,
                    message: 'Could not create xform representation.',
                    duration: notify.duration.MEDIUM,
                });
            });
    }

    private getHTML = (xform: XForm) => ({
        __html: xform.form,
    })

    private form: Form | undefined;

    private handleValidate = () => {
        if (!this.form) {
            console.error('Form was not initialized');
            return;
        }

        this.form.validate()
            .then((valid) => {
                if (valid) {
                    notify.send({
                        title: 'Enketo preview',
                        type: notify.type.SUCCESS,
                        message: 'The form is valid.',
                        duration: notify.duration.MEDIUM,
                    });
                } else {
                    notify.send({
                        title: 'Enketo preview',
                        type: notify.type.ERROR,
                        message: 'The form is invalid.',
                        duration: notify.duration.MEDIUM,
                    });
                }
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
