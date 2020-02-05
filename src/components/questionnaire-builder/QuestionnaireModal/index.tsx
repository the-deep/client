import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram from '@togglecorp/faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import TextInput from '#rsci/TextInput';
import SelectInput from '#rsci/SelectInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalHeader from '#rscv/Modal/Header';
import ModalFooter from '#rscv/Modal/Footer';

import {
    RequestCoordinator,
    RequestClient,
    methods,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    QuestionnaireElement,
    ProjectElement,
    AddRequestProps,
    Requests,
    BaseQuestionElement,
    BasicElement,
} from '#typings';

import {
    defaultKeySelector,
    defaultLabelSelector,
} from '#constants/dummy';

import styles from './styles.scss';

type FormKeys = 'title'
    | 'crisisType'
    | 'enumeratorSkill'
    | 'dataCollectionTechnique'
    | 'requiredDuration';

type QuestionnaireFormElement = Partial<Pick<QuestionnaireElement, FormKeys>>;

interface ComponentProps {
    className?: string;
    projectId: ProjectElement['id'];
    value?: BaseQuestionElement;
    pending?: boolean;
    closeModal?: () => void;
    onRequestSuccess: (response: unknown) => void;
}

type FaramValues = QuestionnaireFormElement;
interface RequestBody extends FaramValues {
    project?: ProjectElement['id'];
    questions?: BaseQuestionElement[];
}

type FaramErrors = {
    [key in keyof QuestionnaireFormElement]: string | undefined;
}

interface Params {
    body: RequestBody;
    questionnaireId?: number;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireCreateRequest: {
        url: '/questionnaires/',
        method: methods.POST,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            props,
            response,
        }) => {
            props.onRequestSuccess(response);
            if (props.closeModal) {
                props.closeModal();
            }
        },
    },
    questionnairePatchRequest: {
        url: ({ params }) => {
            if (!params || !params.questionnaireId) {
                return '';
            }

            return `/questionnaires/${params.questionnaireId}/`;
        },
        method: methods.PATCH,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            props,
            response,
        }) => {
            props.onRequestSuccess(response);
            if (props.closeModal) {
                props.closeModal();
            }
        },
    },
    questionnaireOptionsRequest: {
        url: '/questionnaires/options/',
        method: methods.GET,
        onMount: true,
    },
};


const questionnaireMetaSchema = {
    fields: {
        title: [],
        crisisType: [],
        enumeratorSkill: [],
        dataCollectionTechnique: [],
        requiredDuration: [],
    },
};

const crisisTypeKeySelector = (d: BasicElement) => d.id;

const crisisTypeLabelSelector = (d: BasicElement) => d.title;

class AddQuestionnaireModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            faramValues: props.value ? props.value : {},
            faramErrors: {},
        };
    }

    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
        const {
            projectId,
            requests: {
                questionnaireCreateRequest,
                questionnairePatchRequest,
            },
            value,
        } = this.props;

        if (value) {
            questionnairePatchRequest.do({
                questionnaireId: value.id,
                body: faramValues,
            });
        } else {
            questionnaireCreateRequest.do({
                body: {
                    project: projectId,
                    questions: [],
                    ...faramValues,
                },
            });
        }
    }

    private handleFaramChange = (
        faramValues: FaramValues,
        faramErrors: FaramErrors,
    ) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    public render() {
        const {
            className,
            requests,
            pending: pendingFromProps,
            closeModal,
        } = this.props;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
        } = getResponse(requests, 'questionnaireOptionsRequest');

        const {
            faramValues,
            faramErrors,
        } = this.state;

        const pending = pendingFromProps || isAnyRequestPending(requests);

        return (
            <Modal className={styles.editQuestionnaireModal}>
                <ModalHeader
                    // FIXME: use strings
                    title="Questionnaire details"
                    rightComponent={
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    }
                />
                <Faram
                    schema={questionnaireMetaSchema}
                    className={_cs(className, styles.addQuestionnaireForm)}
                    onChange={this.handleFaramChange}
                    onValidationSuccess={this.handleFaramValidationSuccess}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    <ModalBody>
                        { pending && <LoadingAnimation /> }
                        <TextInput
                            faramElementName="title"
                            className={styles.input}
                            // FIXME: use strings
                            label="Title"
                        />
                        <SelectInput
                            options={crisisTypeOptionList}
                            faramElementName="crisisType"
                            className={styles.input}
                            // FIXME: use strings
                            label="Crisis type"
                            keySelector={crisisTypeKeySelector}
                            labelSelector={crisisTypeLabelSelector}
                        />
                        <SelectInput
                            options={enumeratorSkillOptionList}
                            faramElementName="enumeratorSkill"
                            className={styles.input}
                            // FIXME: use strings
                            label="Enumerator skill"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <SelectInput
                            options={dataCollectionTechniqueOptionList}
                            faramElementName="dataCollectionTechnique"
                            className={styles.input}
                            // FIXME: use strings
                            label="Data collection technique"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <TextInput
                            faramElementName="requiredDuration"
                            className={styles.input}
                            // FIXME: use strings
                            label="Required duration (Minutes)"
                            type="number"
                        />
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={closeModal}
                        >
                            {/* FIXME: use strings */}
                            Cancel
                        </DangerButton>
                        <PrimaryButton
                            type="submit"
                        >
                            {/* FIXME: use strings */}
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        AddQuestionnaireModal,
    ),
);
