import React from 'react';
import { _cs } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import Pager from '#rscv/Pager';

import QuestionnaireModal from '#qbc/QuestionnaireModal';

import {
    MiniQuestionnaireElement,

    Requests,
    AddRequestProps,
    MultiResponse,
} from '#typings';

import {
    RequestClient,
    methods,
} from '#request';

import Questionnaire from '#qbc/Questionnaire';
import styles from './styles.scss';

const ModalButton = modalize(PrimaryButton);

const MAX_QUESTIONNAIRE_PER_PAGE = 10;

type ViewMode = 'active' | 'archived';

interface ComponentProps {
    className?: string;
    title: string;
    projectId: number;
    archived: boolean;
    onQuestionnaireMetaReload: () => void;
    activePage: number;
    onActivePageChange: (page: number) => void;
}

interface State {
    questionnaires: MiniQuestionnaireElement[];
    questionnaireCount: number;
}

interface Params {
    archived?: boolean;
    questionnaireId?: number;
    setQuestionnaires?: (questionnaires: MiniQuestionnaireElement[], totalCount: number) => void;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireRequest: {
        url: '/questionnaires/',
        query: ({ props }) => ({
            project: props.projectId,
            is_archived: props.archived,
            offset: (props.activePage - 1) * MAX_QUESTIONNAIRE_PER_PAGE,
            limit: MAX_QUESTIONNAIRE_PER_PAGE,
        }),
        // FIXME: use `/projects/<id>/questionnaires/` api
        onPropsChanged: ['projectId', 'archived', 'activePage'],
        method: methods.GET,
        onMount: true,
        onSuccess: ({ response, params }) => {
            if (!params || !params.setQuestionnaires) {
                return;
            }

            const questionnaireResponse = response as MultiResponse<MiniQuestionnaireElement>;
            const { results, count } = questionnaireResponse;
            params.setQuestionnaires(results, count);
        },
        // FIXME: write onFailure, onFatal
    },
    questionnaireArchiveRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.PATCH,
        body: ({ params }) => {
            if (!params) {
                return {};
            }
            return {
                isArchived: params.archived,
            };
        },
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnaireRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },
    questionnaireDeleteRequest: {
        url: ({ params }) => `/questionnaires/${params && params.questionnaireId}/`,
        method: methods.DELETE,
        onSuccess: ({ props }) => {
            // NOTE: re-trigger questionnaire request
            props.requests.questionnaireRequest.do();
            props.onQuestionnaireMetaReload();
        },
        // FIXME: write onFailure, onFatal
    },
};

const questionnaireKeySelector = (q: MiniQuestionnaireElement) => q.id;

class QuestionnaireList extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            questionnaires: [],
            questionnaireCount: 0,
        };

        this.props.requests.questionnaireRequest.setDefaultParams({
            setQuestionnaires: (
                questionnaires: MiniQuestionnaireElement[],
                questionnaireCount: number,
            ) => {
                this.setState({
                    questionnaires,
                    questionnaireCount,
                });
            },
        });
    }

    private getQuestionnaireRendererParams = (
        key: MiniQuestionnaireElement['id'],
        questionnaire: MiniQuestionnaireElement,
    ) => ({
        questionnaireKey: key,
        data: questionnaire,
        archived: this.props.archived,
        disabled: this.props.requests.questionnaireArchiveRequest.pending,
        onArchive: this.handleArchive,
        onUnarchive: this.handleUnarchive,
        onDelete: this.handleDelete,
    })

    private handleArchive = (questionnaireId: number) => {
        this.props.requests.questionnaireArchiveRequest.do({
            questionnaireId,
            archived: true,
        });
    }

    private handleUnarchive = (questionnaireId: number) => {
        this.props.requests.questionnaireArchiveRequest.do({
            questionnaireId,
            archived: false,
        });
    }

    private handleDelete = (questionnaireId: number) => {
        this.props.requests.questionnaireDeleteRequest.do({
            questionnaireId,
        });
    }

    private handleQuestionnaireFormRequestSuccess = () => {
        this.props.requests.questionnaireRequest.do();
    }

    public render() {
        const {
            className,
            title,
            projectId,
            archived,
            requests: {
                questionnaireRequest: {
                    pending,
                    response: questionnaireResponse,
                },
            },
            activePage,
            onActivePageChange,
        } = this.props;
        const {
            questionnaires,
            questionnaireCount,
        } = this.state;

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        { title }
                    </h3>
                    {!archived && (
                        <ModalButton
                            modal={
                                <QuestionnaireModal
                                    onRequestSuccess={this.handleQuestionnaireFormRequestSuccess}
                                    projectId={projectId}
                                />
                            }
                        >
                            {/* FIXME: use strings */}
                            Add questionnaire
                        </ModalButton>
                    )}
                </header>
                <ListView
                    className={styles.content}
                    data={questionnaires}
                    renderer={Questionnaire}
                    rendererParams={this.getQuestionnaireRendererParams}
                    keySelector={questionnaireKeySelector}
                    pending={pending}
                />
                <Pager
                    activePage={activePage}
                    itemsCount={questionnaireCount}
                    maxItemsPerPage={MAX_QUESTIONNAIRE_PER_PAGE}
                    showItemsPerPageChange={false}
                    onPageClick={onActivePageChange}
                    // onItemsPerPageChange={this.handleLeadsPerPageChange}
                />
            </div>
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionnaireList,
);
