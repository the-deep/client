import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';

import {
    QuestionnaireItem,
    Requests,
    AddRequestProps,
} from '#typings';

import {
    RequestClient,
    methods,
    getResults,
    getPending,
} from '#request';

import Questionnaire from './Questionnaire';
import styles from './styles.scss';

type ViewMode = 'active' | 'archived';

interface ComponentProps {
    className?: string;
    title: string;
    projectId: number;
    archived: boolean;
    fetchTimestamp: number;
    onQuestionnaireMetaReload: () => void;
}

interface Params {
    archived?: boolean;
    questionnaireId?: number;
}

type Props = AddRequestProps<ComponentProps, Params>;

const requestOptions: Requests<ComponentProps, Params> = {
    questionnaireRequest: {
        url: '/questionnaires/',
        query: ({ props }) => ({
            project: props.projectId,
            is_archived: props.archived,
        }),
        // FIXME: use `/projects/<id>/questionnaires/` api
        onPropsChanged: ['projectId', 'archived', 'fetchTimestamp'],
        method: methods.GET,
        onMount: true,
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
};

const questionnaireKeySelector = (q: QuestionnaireItem) => q.id;

class QuestionnaireList extends React.PureComponent<Props> {
    private getQuestionnaireRendererParams = (
        key: QuestionnaireItem['id'],
        questionnaire: QuestionnaireItem,
    ) => ({
        questionnaireKey: key,
        data: questionnaire,
        archived: this.props.archived,
        disabled: this.props.requests.questionnaireArchiveRequest.pending,
        onArchive: this.handleArchive,
        onUnarchive: this.handleUnarchive,
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

    private hanldeUnarchive = () => {
    }

    public render() {
        const {
            className,
            title,
            requests,
        } = this.props;

        const pending = getPending(requests, 'questionnaireRequest');
        const questionnaireList = getResults(requests, 'questionnaireRequest') as QuestionnaireItem[] | undefined;

        return (
            <div className={_cs(className, styles.questionnaireList)}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        { title }
                    </h3>
                </header>
                <ListView
                    className={styles.content}
                    data={questionnaireList}
                    renderer={Questionnaire}
                    rendererParams={this.getQuestionnaireRendererParams}
                    keySelector={questionnaireKeySelector}
                    pending={pending}
                />
            </div>
        );
    }
}

export default RequestClient(requestOptions)(
    QuestionnaireList,
);
