import React from 'react';
import memoize from 'memoize-one';
import Faram from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';

import { getMatrix2dStructures } from '#utils/framework';

import {
    RequestCoordinator,
    RequestClient,
    methods,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    FrameworkElement,
    QuestionFormElement,
    AddRequestProps,
    Requests,
} from '#typings';

import FrameworkAttributeInput from './FrameworkAttributeInput';
import ResponseInput from './ResponseInput';
import styles from './styles.scss';

const defaultQuestionValue: QuestionFormElement = {
    responseOptionList: [],
    frameworkAttribute: {
        type: 'sector',
    },
};

type FaramValues = Partial<QuestionFormElement>;

interface FaramErrors {}

interface ComponentProps {
    className?: string;
    framework?: FrameworkElement;
    value?: QuestionFormElement;
    onSuccess: (faramValues: FaramValues) => void;
    closeModal?: () => void;

    pending?: boolean;
}

interface State {
    faramValues: FaramValues;
    faramErrors: FaramErrors;
}

interface Params {
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireOptionsRequest: {
        url: '/questionnaires/options/',
        method: methods.GET,
        onMount: true,
    },
};

const crisisTypeKeySelector = d => d.id;
const crisisTypeLabelSelector = d => d.title;

const defaultKeySelector = d => d.key;
const defaultLabelSelector = d => d.value;

interface Schema {
    fields: {
        [key: string]: unknown[];
    };
}

class QuestionModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        const { value, framework } = this.props;

        this.state = {
            faramValues: value || defaultQuestionValue,
            faramErrors: {},
        };

        const schema: Schema = {
            fields: {
                title: [],
                type: [],
                enumeratorInstruction: [],
                respondentInstruction: [],
                crisisType: [],
                enumeratorSkill: [],
                dataCollectionTechnique: [],
                importance: [],
                responseOptions: [],
            },
        };
        if (framework) {
            schema.fields.frameworkAttribute = [];
        }
        this.schema = schema;
    }

    private getFrameworkOptions = memoize(getMatrix2dStructures)

    private schema: Schema;

    private handleChange = (faramValues: FaramValues, faramErrors: FaramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    }

    private handleValidationFailure = (faramErrors: FaramErrors) => {
        this.setState({ faramErrors });
    }

    private handleValidationSuccess = (faramValues: FaramValues) => {
        const { onSuccess } = this.props;
        onSuccess(faramValues);
    }

    render() {
        const {
            requests,
            className,
            framework,
            closeModal,
            pending: pendingFromProps,
        } = this.props;

        const {
            faramValues,
            faramErrors,
        } = this.state;

        const pending = isAnyRequestPending(requests) || pendingFromProps;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
            questionTypeOptions: questionTypeOptionList,
            questionImportanceOptions: questionImportanceOptionList,
        } = getResponse(requests, 'questionnaireOptionsRequest');

        return (
            <Modal className={styles.editQuestionnaireModal}>
                <ModalHeader
                    // FIXME: use strings
                    title="Question"
                    rightComponent={
                        <Button
                            iconName="close"
                            onClick={closeModal}
                            transparent
                        />
                    }
                />
                <Faram
                    className={_cs(className, styles.questionForm)}
                    schema={this.schema}
                    onChange={this.handleChange}
                    value={faramValues}
                    error={faramErrors}
                    onValidationSuccess={this.handleValidationSuccess}
                    onValidationFailure={this.handleValidationFailure}
                    disabled={pending}
                >
                    <ModalBody>
                        { pending && <LoadingAnimation /> }
                        <section className={styles.basic}>
                            <header className={styles.header}>
                                <h4 className={styles.heading}>
                                    {/* FIXME: use strings */}
                                    Basic details
                                </h4>
                            </header>
                            <div className={styles.content}>
                                <TextInput
                                    faramElementName="title"
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Title"
                                />
                                <SelectInput
                                    options={questionTypeOptionList}
                                    faramElementName="type"
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Type"
                                    keySelector={defaultKeySelector}
                                    labelSelector={defaultLabelSelector}
                                />
                                <ResponseInput
                                    type={faramValues.type}
                                    faramElementName="responseOptions"
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Response options"
                                />
                                <TextInput
                                    faramElementName="enumeratorInstruction"
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Enumerator instructions"
                                />
                                <TextInput
                                    faramElementName="respondentInstuction"
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Respondent instructions"
                                />
                            </div>
                        </section>
                        { framework && (
                            <section className={styles.frameworkDetails}>
                                <header className={styles.header}>
                                    <h4 className={styles.heading}>
                                        {/* FIXME: use strings */}
                                        Framework
                                    </h4>
                                </header>
                                <div className={styles.content}>
                                    <FrameworkAttributeInput
                                        faramElementName="frameworkAttribute"
                                        {...this.getFrameworkOptions(framework)}
                                    />
                                </div>
                            </section>
                        )}
                        <section className={styles.metadata}>
                            <header className={styles.header}>
                                <h4 className={styles.heading}>
                                    Metadata
                                </h4>
                            </header>
                            <div className={styles.content}>
                                <SelectInput
                                    faramElementName="crisisType"
                                    options={crisisTypeOptionList}
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Crisis type"
                                    keySelector={crisisTypeKeySelector}
                                    labelSelector={crisisTypeLabelSelector}
                                />
                                <SelectInput
                                    faramElementName="enumeratorSkill"
                                    options={enumeratorSkillOptionList}
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Enumerator skill"
                                    keySelector={defaultKeySelector}
                                    labelSelector={defaultLabelSelector}
                                />
                                <SelectInput
                                    faramElementName="dataCollectionTechnique"
                                    options={dataCollectionTechniqueOptionList}
                                    className={styles.input}
                                    // FIXME: use strings
                                    label="Data collection technique"
                                    keySelector={defaultKeySelector}
                                    labelSelector={defaultLabelSelector}
                                />
                                <SelectInput
                                    faramElementName="importance"
                                    className={styles.input}
                                    options={questionImportanceOptionList}
                                    // FIXME: use strings
                                    label="Question importance"
                                    keySelector={defaultKeySelector}
                                    labelSelector={defaultLabelSelector}
                                />
                            </div>
                        </section>
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={closeModal}
                        >
                            {/* FIXME: use strings */}
                            Cancel
                        </DangerButton>
                        <Button
                            type="submit"
                            disabled={pending}
                        >
                            {/* FIXME: use strings */}
                            Save
                        </Button>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

export default RequestCoordinator(
    RequestClient(requestOptions)(
        QuestionModal,
    ),
);
