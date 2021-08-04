import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Faram, { requiredCondition, FaramInputElement } from '@togglecorp/faram';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import RawMinuteSecondInput from '#components/input/MinuteSecondInput';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';
import notify from '#notify';

import {
    QuestionnaireElement,
    ProjectElement,
    AddRequestProps,
    Requests,
    BaseQuestionElement,
    BasicElement,
    QuestionnaireOptions,
} from '#types';

import {
    defaultKeySelector,
    defaultLabelSelector,
} from '#constants/dummy';

import styles from './styles.scss';

const MinuteSecondInput = FaramInputElement(RawMinuteSecondInput);

type FormKeys = 'title'
    | 'crisisTypes'
    | 'enumeratorSkill'
    | 'dataCollectionTechniques'
    | 'requiredDuration';

type QuestionnaireFormElement = Partial<Pick<QuestionnaireElement, FormKeys>>;

interface ComponentProps {
    className?: string;
    isClone?: boolean;
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
    crisisTypesId?: number[];
}

type FaramErrors = {
    [key: string]: string | undefined | string [];
}

interface Error {
    faramErrors: FaramErrors;
}

interface Params {
    body?: RequestBody;
    questionnaireId?: number;
    setFaramErrors?: (faramErrors: FaramErrors) => void;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
    pristine: boolean;
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
            const questionnaire = response as QuestionnaireElement;
            props.onRequestSuccess(questionnaire);
            notify.send({
                type: notify.type.SUCCESS,
                title: 'Questionnaire',
                message: `Questionnaire ${questionnaire ? questionnaire.title : ''} was successfully created.`,
                duration: notify.duration.MEDIUM,
            });
            if (props.closeModal) {
                props.closeModal();
            }
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
            notify.send({
                type: notify.type.SUCCESS,
                title: 'Questionnaire',
                message: 'Questionnaire was sccessfully updated.',
                duration: notify.duration.MEDIUM,
            });
            if (props.closeModal) {
                props.closeModal();
            }
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
    questionnaireCloneRequest: {
        url: ({ params }) => {
            if (!params || !params.questionnaireId) {
                return '';
            }

            return `/questionnaires/${params.questionnaireId}/clone/`;
        },
        method: methods.POST,
        body: ({ params: { body } = { body: undefined } }) => body,
        onSuccess: ({
            props,
            response,
        }) => {
            const questionnaire = response as QuestionnaireElement;
            props.onRequestSuccess(questionnaire);
            notify.send({
                type: notify.type.SUCCESS,
                title: 'Questionnaire',
                message: `Questionnaire ${questionnaire ? questionnaire.title : ''} was successfully created.`,
                duration: notify.duration.MEDIUM,
            });
            if (props.closeModal) {
                props.closeModal();
            }
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
    questionnaireOptionsRequest: {
        url: '/questionnaires/options/',
        method: methods.GET,
        onMount: true,
        onFailure: notifyOnFailure('Questionnaire Options'),
        onFatal: notifyOnFatal('Questionnaire Options'),
    },
};


const questionnaireMetaSchema = {
    fields: {
        title: [requiredCondition],
        crisisTypes: [],
        enumeratorSkill: [requiredCondition],
        dataCollectionTechniques: [requiredCondition],
        requiredDuration: [requiredCondition],
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
            pristine: true,
        };
    }

    private handleFaramValidationFailure = (faramErrors: FaramErrors) => {
        this.setState({ faramErrors });
    }

    private handleFaramValidationSuccess = (faramValues: FaramValues) => {
        const {
            projectId,
            requests: {
                questionnaireCreateRequest,
                questionnairePatchRequest,
                questionnaireCloneRequest,
            },
            value,
            isClone,
        } = this.props;

        if (!value) {
            questionnaireCreateRequest.do({
                body: {
                    project: projectId,
                    questions: [],
                    ...faramValues,
                },
                setFaramErrors: (faramErrors: FaramErrors) => {
                    this.setState({ faramErrors });
                },
            });
        } else if (isClone) {
            questionnaireCloneRequest.do({
                questionnaireId: value.id,
                body: {
                    ...faramValues,
                    crisisTypesId: faramValues.crisisTypes,
                },
                setFaramErrors: (faramErrors: FaramErrors) => {
                    this.setState({ faramErrors });
                },
            });
        } else {
            questionnairePatchRequest.do({
                questionnaireId: value.id,
                body: faramValues,
                setFaramErrors: (faramErrors: FaramErrors) => {
                    this.setState({ faramErrors });
                },
            });
        }
        this.setState({
            pristine: true,
        });
    }

    private handleFaramChange = (
        faramValues: FaramValues,
        faramErrors: FaramErrors,
    ) => {
        console.warn(faramValues);
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    public render() {
        const {
            className,
            pending: pendingFromProps,
            closeModal,
            requests: {
                questionnaireOptionsRequest: {
                    response = {},
                    pending: questionnaireOptionsPending,
                },
                questionnaireCreateRequest: {
                    pending: questionnaireCreatePending,
                },
                questionnairePatchRequest: {
                    pending: questionnairePatchPending,
                },
                questionnaireCloneRequest: {
                    pending: questionnaireClonePending,
                },
            },
        } = this.props;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
        } = response as QuestionnaireOptions;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.state;

        const pendingResponse = (
            questionnaireOptionsPending
            || questionnaireCreatePending
            || questionnairePatchPending
            || questionnaireClonePending
        );

        const pending = pendingResponse || pendingFromProps;

        return (
            <Modal>
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
                    onValidationFailure={this.handleFaramValidationFailure}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    <ModalBody className={styles.modalBody}>
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="title"
                            className={styles.input}
                            // FIXME: use strings
                            label="Title"
                        />
                        <MultiSelectInput
                            options={crisisTypeOptionList}
                            faramElementName="crisisTypes"
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
                        <MultiSelectInput
                            options={dataCollectionTechniqueOptionList}
                            faramElementName="dataCollectionTechniques"
                            className={styles.input}
                            // FIXME: use strings
                            label="Data collection technique"
                            keySelector={defaultKeySelector}
                            labelSelector={defaultLabelSelector}
                        />
                        <MinuteSecondInput
                            faramElementName="requiredDuration"
                            className={_cs(styles.input, styles.durationInput)}
                            label="Required duration"
                            // FIXME: use strings
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
                            disabled={pristine}
                            pending={pending}
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
