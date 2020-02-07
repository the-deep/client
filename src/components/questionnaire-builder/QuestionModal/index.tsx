import React from 'react';
import memoize from 'memoize-one';
import Faram, { requiredCondition } from '@togglecorp/faram';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import NumberInput from '#rsci/NumberInput';
import SegmentInput from '#rsci/SegmentInput';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ScrollTabs from '#rscv/ScrollTabs';

import { getMatrix2dStructures } from '#utils/framework';

import {
    RequestClient,
    methods,
    getResponse,
    isAnyRequestPending,
} from '#request';

import {
    KeyValueElement,
    BasicElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    AddRequestProps,
    Requests,
} from '#typings';

import FrameworkAttributeInput from './FrameworkAttributeInput';
import ResponseInput from './ResponseInput';
import styles from './styles.scss';

type QuestionKeys = 'title'
    | 'type'
    | 'enumeratorInstruction'
    | 'respondentInstruction'
    | 'crisisType'
    | 'enumeratorSkill'
    | 'dataCollectionTechnique'
    | 'importance'
    | 'responseOptions'
    | 'frameworkAttribute'
    | 'requiredDuration';

type QuestionFormElement = Partial<Pick<BaseQuestionElement, QuestionKeys>>;

export type FaramValues = QuestionFormElement;

export interface FaramErrors {
    [key: string]: string | undefined | string [];
}

interface ComponentProps {
    className?: string;
    framework?: MiniFrameworkElement;
    closeModal?: () => void;

    pending?: boolean;

    value?: FaramValues;
    error?: FaramErrors;
    onValueChange: (value: FaramValues, error: FaramErrors) => void;
    onErrorChange: (error: FaramErrors) => void;
    onSuccess: (value: FaramValues) => void;
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

const crisisTypeKeySelector = (d: BasicElement) => d.id;
const crisisTypeLabelSelector = (d: BasicElement) => d.title;

const defaultKeySelector = (d: KeyValueElement) => d.key;
const defaultLabelSelector = (d: KeyValueElement) => d.value;

interface Schema {
    fields: {
        [key: string]: unknown[];
    };
}

type TabElement = 'basic' | 'frameworkDetails' | 'metadata';

const tabs: {[key in TabElement]: string} = {
    basic: 'Basic',
    frameworkDetails: 'Framework Details',
    metadata: 'Metadata',
};

interface State {
    activeTab: TabElement;
}

class QuestionModal extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        const { framework } = this.props;

        const schema: Schema = {
            fields: {
                title: [requiredCondition],
                type: [requiredCondition],
                enumeratorInstruction: [],
                respondentInstruction: [],
                crisisType: [],
                enumeratorSkill: [requiredCondition],
                dataCollectionTechnique: [requiredCondition],
                importance: [requiredCondition],
                requiredDuration: [],
                // FIXME: this should be dynamic, only available if type is 'select'
                responseOptions: [],
            },
        };
        if (framework) {
            schema.fields.frameworkAttribute = [];
        }
        this.schema = schema;

        this.state = {
            activeTab: 'basic',
        };
    }

    private getFrameworkOptions = memoize(getMatrix2dStructures)

    private schema: Schema;

    private handleTabClick = (activeTab: TabElement) => {
        this.setState({ activeTab });
    }

    render() {
        const { activeTab } = this.state;

        const {
            requests,
            className,
            framework,
            closeModal,
            pending: pendingFromProps,
            value,
            error,

            onValueChange,
            onErrorChange,
            onSuccess,
        } = this.props;

        const pending = isAnyRequestPending(requests) || pendingFromProps;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
            questionTypeOptions: questionTypeOptionList,
            questionImportanceOptions: questionImportanceOptionList,
        } = getResponse(requests, 'questionnaireOptionsRequest');

        const {
            sectorList,
            subsectorList,
            dimensionList,
            subdimensionList,
        } = this.getFrameworkOptions(framework);

        return (
            <Modal className={styles.questionForm}>
                <ModalHeader
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
                    onChange={onValueChange}
                    value={value}
                    error={error}
                    onValidationSuccess={onSuccess}
                    onValidationFailure={onErrorChange}
                    disabled={pending}
                >
                    <ModalBody className={styles.modalBody}>
                        <ScrollTabs
                            className={styles.tabs}
                            tabs={tabs}
                            active={activeTab}
                            itemClassName={styles.tab}
                            blankClassName={styles.blankTab}
                            onClick={this.handleTabClick}
                        />
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors faramElement />
                        {activeTab === 'basic' && (
                            <section className={styles.basic}>
                                <div className={styles.content}>
                                    <TextInput
                                        faramElementName="title"
                                        className={styles.input}
                                        label="Title"
                                    />
                                    <SelectInput
                                        options={questionTypeOptionList}
                                        faramElementName="type"
                                        className={styles.input}
                                        label="Type"
                                        keySelector={defaultKeySelector}
                                        labelSelector={defaultLabelSelector}
                                    />
                                    <ResponseInput
                                        type={value && value.type}
                                        faramElementName="responseOptions"
                                        className={styles.input}
                                        label="Response options"
                                    />
                                    <TextInput
                                        faramElementName="enumeratorInstruction"
                                        className={styles.input}
                                        label="Enumerator instructions"
                                    />
                                    <TextInput
                                        faramElementName="respondentInstruction"
                                        className={styles.input}
                                        label="Respondent instructions"
                                    />
                                </div>
                            </section>
                        )}
                        {activeTab === 'frameworkDetails' && (
                            <section className={styles.frameworkDetails}>
                                <div className={styles.content}>
                                    <FrameworkAttributeInput
                                        className={styles.frameworkAttributeInput}
                                        faramElementName="frameworkAttribute"
                                        disabled={pending || !framework}
                                        sectorList={sectorList}
                                        subsectorList={subsectorList}
                                        dimensionList={dimensionList}
                                        subdimensionList={subdimensionList}
                                    />
                                </div>
                            </section>
                        )}
                        {activeTab === 'metadata' && (
                            <section className={styles.metadata}>
                                <div className={styles.content}>
                                    <SelectInput
                                        faramElementName="crisisType"
                                        options={crisisTypeOptionList}
                                        className={styles.input}
                                        label="Crisis type"
                                        keySelector={crisisTypeKeySelector}
                                        labelSelector={crisisTypeLabelSelector}
                                    />
                                    <SelectInput
                                        faramElementName="enumeratorSkill"
                                        options={enumeratorSkillOptionList}
                                        className={styles.input}
                                        label="Enumerator skill"
                                        keySelector={defaultKeySelector}
                                        labelSelector={defaultLabelSelector}
                                    />
                                    <SelectInput
                                        faramElementName="dataCollectionTechnique"
                                        options={dataCollectionTechniqueOptionList}
                                        className={styles.input}
                                        label="Data collection technique"
                                        keySelector={defaultKeySelector}
                                        labelSelector={defaultLabelSelector}
                                    />
                                    <NumberInput
                                        faramElementName="requiredDuration"
                                        className={styles.input}
                                        separator=" "
                                        label="Required duration (Minutes)"
                                    />
                                    <SegmentInput
                                        faramElementName="importance"
                                        className={styles.input}
                                        options={questionImportanceOptionList}
                                        label="Question importance"
                                        keySelector={defaultKeySelector}
                                        labelSelector={defaultLabelSelector}
                                    />
                                </div>
                            </section>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <DangerButton
                            onClick={closeModal}
                        >
                            Cancel
                        </DangerButton>
                        <Button
                            type="submit"
                            disabled={pending}
                        >
                            Save
                        </Button>
                    </ModalFooter>
                </Faram>
            </Modal>
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionModal,
);
