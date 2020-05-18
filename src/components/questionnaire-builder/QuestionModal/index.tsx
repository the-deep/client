import React from 'react';
import memoize from 'memoize-one';
import Faram, {
    requiredCondition,
    FaramGroup,
    FaramList,
    FaramInputElement,
    Schema,
} from '@togglecorp/faram';
import {
    _cs,
    randomString,
    getDuplicates,
    listToMap,
    mapToList,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import RawMinuteSecondInput from '#components/input/MinuteSecondInput';
import SegmentInput from '#rsci/SegmentInput';
import SelectInput from '#rsci/SelectInput';
import TextInput from '#rsci/TextInput';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalBody from '#rscv/Modal/Body';
import ModalFooter from '#rscv/Modal/Footer';
import ModalHeader from '#rscv/Modal/Header';
import ScrollTabs from '#rscv/ScrollTabs';

import TabTitle from '#components/general/TabTitle';
import { getMatrix2dStructures } from '#utils/framework';

import {
    RequestClient,
    methods,
} from '#request';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import {
    KeyValueElement,
    BasicElement,
    MiniFrameworkElement,
    BaseQuestionElement,
    AddRequestProps,
    Requests,
    QuestionnaireOptions,
    LanguageTitle,
} from '#typings';

import FrameworkAttributeInput from './FrameworkAttributeInput';
import MoreTitleRow from './MoreTitleRow';
import ResponseInput from './ResponseInput';

import styles from './styles.scss';

const EmptyComponent = () => null;

const MinuteSecondInput = FaramInputElement(RawMinuteSecondInput);

type DetailKeys = 'title'
    | 'type'
    | 'enumeratorInstruction'
    | 'respondentInstruction'
    | 'crisisType'
    | 'responseOptions';

type FrameworkKeys = 'frameworkAttribute';

type MetadataKeys = 'crisisType'
    | 'enumeratorSkill'
    | 'dataCollectionTechnique'
    | 'importance'
    | 'requiredDuration';

interface QuestionFormElement {
    detail: Partial<Pick<BaseQuestionElement, DetailKeys>> & { moreTitles?: LanguageTitle[] };
    analysisFramework: Partial<Pick<BaseQuestionElement, FrameworkKeys>>;
    metadata: Partial<Pick<BaseQuestionElement, MetadataKeys>>;
}

const languageKeySelector = (elem: LanguageTitle) => elem.uniqueKey;

export function transformIn(value: Omit<BaseQuestionElement, 'id'> | undefined): QuestionFormElement {
    if (!value) {
        return {
            detail: {},
            analysisFramework: {},
            metadata: {},
        };
    }

    const {
        title,
        moreTitles,
        type,
        enumeratorInstruction,
        respondentInstruction,
        responseOptions,
        frameworkAttribute,
        crisisType,
        enumeratorSkill,
        dataCollectionTechnique,
        importance,
        requiredDuration,
    } = value;

    const moreTitlesList = mapToList(moreTitles, (d: string, k: string | number) => {
        const key = k as string;

        return ({
            key,
            uniqueKey: randomString(16),
            title: d,
        });
    });

    return {
        detail: {
            title,
            moreTitles: moreTitlesList,
            type,
            enumeratorInstruction,
            respondentInstruction,
            responseOptions,
        },
        analysisFramework: {
            frameworkAttribute,
        },
        metadata: {
            crisisType,
            enumeratorSkill,
            dataCollectionTechnique,
            importance,
            requiredDuration,
        },
    };
}

export function transformOut(value: QuestionFormElement) {
    const {
        detail: {
            title,
            moreTitles,
            type,
            enumeratorInstruction,
            respondentInstruction,
            responseOptions,
        },
        analysisFramework: {
            frameworkAttribute,
        },
        metadata: {
            crisisType,
            enumeratorSkill,
            dataCollectionTechnique,
            importance,
            requiredDuration,
        },
    } = value;

    const moreTitlesMap = listToMap(
        moreTitles,
        (d: LanguageTitle) => d.key,
        (d: LanguageTitle) => d.title,
    );

    return {
        title,
        type,
        moreTitles: moreTitlesMap,
        enumeratorInstruction,
        respondentInstruction,
        responseOptions,
        frameworkAttribute,
        crisisType,
        enumeratorSkill,
        dataCollectionTechnique,
        importance,
        requiredDuration,
    };
}

export function errorTransformIn(value: FaramErrors) {
    const {
        $internal,
        title,
        moreTitles,
        type,
        enumeratorInstruction,
        respondentInstruction,
        responseOptions,
        frameworkAttribute,
        crisisType,
        enumeratorSkill,
        dataCollectionTechnique,
        importance,
        requiredDuration,
    } = value;

    return {
        $internal,
        detail: {
            title,
            moreTitles,
            type,
            enumeratorInstruction,
            respondentInstruction,
            responseOptions,
        },
        analysisFramework: {
            frameworkAttribute,
        },
        metadata: {
            crisisType,
            enumeratorSkill,
            dataCollectionTechnique,
            importance,
            requiredDuration,
        },
    };
}

export type FaramValues = QuestionFormElement;

export interface FaramErrors {
    [key: string]: string | undefined | string [] | FaramErrors;
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
        onFailure: notifyOnFailure('Questionnaire Options'),
        onFatal: notifyOnFatal('Questionnaire Options'),
    },
};

const crisisTypeKeySelector = (d: BasicElement) => d.id;
const crisisTypeLabelSelector = (d: BasicElement) => d.title;

const defaultKeySelector = (d: KeyValueElement) => d.key;
const defaultLabelSelector = (d: KeyValueElement) => d.value;

type TabElement = 'detail' | 'analysisFramework' | 'metadata';

const tabs: {[key in TabElement]: string} = {
    detail: 'Basic',
    analysisFramework: 'Framework Details',
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
                detail: {
                    fields: {
                        title: [requiredCondition],
                        moreTitles: {
                            validation: (moreTitles: LanguageTitle[]) => {
                                const errors = [];
                                const duplicates = getDuplicates(moreTitles, o => o.key);
                                if (duplicates.length > 0) {
                                    errors.push(`Duplicate items are not allowed: ${duplicates.join(', ')}`);
                                }
                                return errors;
                            },
                            keySelector: languageKeySelector,
                            member: {
                                fields: {
                                    title: [requiredCondition],
                                    key: [requiredCondition],
                                },
                            },
                        },
                        type: [requiredCondition],
                        enumeratorInstruction: [],
                        respondentInstruction: [],
                        responseOptions: [],
                    },
                },
                metadata: {
                    fields: {
                        crisisType: [],
                        enumeratorSkill: [requiredCondition],
                        dataCollectionTechnique: [requiredCondition],
                        importance: [requiredCondition],
                        requiredDuration: [],
                        // FIXME: this should be dynamic, only available if type is 'select'
                    },
                },
            },
        };
        if (framework) {
            schema.fields.analysisFramework = {
                fields: {
                    frameworkAttribute: [],
                },
            };
        }
        this.schema = schema;

        this.state = {
            activeTab: 'detail',
        };
    }

    private getFrameworkOptions = memoize(getMatrix2dStructures)

    private schema: Schema;

    private handleTabClick = (activeTab: TabElement) => {
        this.setState({ activeTab });
    }

    private tabRendererParams = (key: TabElement, title: string) => ({
        title,
        faramElementName: key,
    })

    private languageOptionAddClick = (options: LanguageTitle[] = []) => (
        [
            ...options,
            {
                key: undefined,
                uniqueKey: randomString(16),
                label: '',
            },
        ]
    )

    private moreTitlesRendererParams = (key: LanguageTitle['uniqueKey'], data: LanguageTitle, index: number) => ({
        dataIndex: index,
    });


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

        const {
            questionnaireOptionsRequest: {
                response = {},
                pending: responsePending,
            },
        } = requests;

        const pending = responsePending || pendingFromProps;

        const {
            enumeratorSkillOptions: enumeratorSkillOptionList,
            dataCollectionTechniqueOptions: dataCollectionTechniqueOptionList,
            crisisTypeOptions: crisisTypeOptionList,
            questionTypeOptions: questionTypeOptionList,
            questionImportanceOptions: questionImportanceOptionList,
        } = response as QuestionnaireOptions;

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
                            renderer={TabTitle}
                            rendererClassName={styles.tabTitle}
                            rendererParams={this.tabRendererParams}
                            // modifier={this.renderTab}
                        />
                        { pending && <LoadingAnimation /> }
                        <NonFieldErrors faramElement />
                        {activeTab === 'detail' && (
                            <section className={styles.basic}>
                                <div className={styles.content}>
                                    <FaramGroup
                                        faramElementName="detail"
                                    >
                                        <TextInput
                                            faramElementName="title"
                                            label="Title"
                                        />
                                        <FaramList
                                            keySelector={languageKeySelector}
                                            faramElementName="moreTitles"
                                        >
                                            <div className={styles.moreTitles}>
                                                {(
                                                    value
                                                    && value.detail.moreTitles
                                                    && value.detail.moreTitles.length > 0
                                                ) && (
                                                    <NonFieldErrors faramElement />
                                                )}
                                                <ListView
                                                    faramElement
                                                    emptyComponent={EmptyComponent}
                                                    renderer={MoreTitleRow}
                                                    rendererParams={this.moreTitlesRendererParams}
                                                />
                                                <div className={styles.buttonContainer}>
                                                    <Button
                                                        faramElementName="add-btn"
                                                        faramAction={this.languageOptionAddClick}
                                                        iconName="add"
                                                        transparent
                                                    >
                                                        Add Another Label
                                                    </Button>
                                                </div>
                                            </div>
                                        </FaramList>
                                        <SelectInput
                                            options={questionTypeOptionList}
                                            faramElementName="type"
                                            label="Type"
                                            keySelector={defaultKeySelector}
                                            labelSelector={defaultLabelSelector}
                                        />
                                        <ResponseInput
                                            moreTitles={value && value.detail.moreTitles}
                                            type={value && value.detail.type}
                                            faramElementName="responseOptions"
                                            label="Response options"
                                        />
                                        <TextInput
                                            faramElementName="enumeratorInstruction"
                                            label="Enumerator instructions"
                                        />
                                        <TextInput
                                            faramElementName="respondentInstruction"
                                            label="Respondent instructions"
                                        />
                                    </FaramGroup>
                                </div>
                            </section>
                        )}
                        {activeTab === 'analysisFramework' && (
                            <section className={styles.frameworkDetails}>
                                <div className={styles.content}>
                                    <FaramGroup
                                        faramElementName="analysisFramework"
                                    >
                                        <FrameworkAttributeInput
                                            className={styles.frameworkAttributeInput}
                                            faramElementName="frameworkAttribute"
                                            disabled={pending || !framework}
                                            sectorList={sectorList}
                                            subsectorList={subsectorList}
                                            dimensionList={dimensionList}
                                            subdimensionList={subdimensionList}
                                        />
                                    </FaramGroup>
                                </div>
                            </section>
                        )}
                        {activeTab === 'metadata' && (
                            <section className={styles.metadata}>
                                <div className={styles.content}>
                                    <FaramGroup
                                        faramElementName="metadata"
                                    >
                                        <SelectInput
                                            faramElementName="crisisType"
                                            options={crisisTypeOptionList}
                                            label="Crisis type"
                                            keySelector={crisisTypeKeySelector}
                                            labelSelector={crisisTypeLabelSelector}
                                        />
                                        <SelectInput
                                            faramElementName="enumeratorSkill"
                                            options={enumeratorSkillOptionList}
                                            label="Enumerator skill"
                                            keySelector={defaultKeySelector}
                                            labelSelector={defaultLabelSelector}
                                        />
                                        <SelectInput
                                            faramElementName="dataCollectionTechnique"
                                            options={dataCollectionTechniqueOptionList}
                                            label="Data collection technique"
                                            keySelector={defaultKeySelector}
                                            labelSelector={defaultLabelSelector}
                                        />
                                        <MinuteSecondInput
                                            faramElementName="requiredDuration"
                                            label="Required duration"
                                            // FIXME: use strings
                                        />
                                        <SegmentInput
                                            faramElementName="importance"
                                            options={questionImportanceOptionList}
                                            label="Question importance"
                                            keySelector={defaultKeySelector}
                                            labelSelector={defaultLabelSelector}
                                        />
                                    </FaramGroup>
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
