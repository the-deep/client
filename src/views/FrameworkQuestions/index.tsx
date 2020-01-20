import React from 'react';
import { connect } from 'react-redux';

import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    methods,
    RequestCoordinator,
    RequestClient,
    getResponse,
    getPending,
} from '#request';
import { pathNames } from '#constants';
import {
    QuestionElement,
    Requests,
    AddRequestProps,
    FrameworkElement,
    AppState,
    AppProps,
} from '#typings';
import { afIdFromRouteSelector } from '#redux';
import BackLink from '#components/general/BackLink';
import QuestionList from '#qbc/QuestionList';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
}

interface PropsFromAppState {
    frameworkId: FrameworkElement['id'];
}

interface Params {
}

interface State {
}

type ComponentPropsWithAppState = PropsFromAppState & ComponentProps;
type Props = AddRequestProps<ComponentPropsWithAppState, Params>;

const mapStateToProps = (state: AppState, props: AppProps) => ({
    frameworkId: afIdFromRouteSelector(state),
});

const requestOptions: Requests<ComponentPropsWithAppState, Params> = {
    frameworkGetRequest: {
        url: ({ props: { frameworkId } }: { props: Props }) => `/analysis-frameworks/${frameworkId}/`,
        onMount: true,
        method: methods.GET,
    },
};

const questionKeySelector = (q: QuestionElement) => q.id;

class FrameworkQuestions extends React.PureComponent<Props> {
    private getQuestionRendererParams = (key: QuestionElement['id'], question: QuestionElement) => {
        const { requests } = this.props;
        const framework = getResponse(requests, 'frameworkGetRequest') as FrameworkElement;

        return {
            data: question,
            framework,
            className: styles.question,
        };
    }

    public render() {
        const {
            className,
            requests,
        } = this.props;

        const framework = getResponse(requests, 'frameworkGetRequest') as FrameworkElement;
        const pending = getPending(requests, 'frameworkGetRequest');

        return (
            <>
                <Page
                    headerAboveSidebar
                    className={_cs(className, styles.frameworkQuestions)}
                    sidebarClassName={styles.sidebar}
                    sidebar={(
                        <>
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    Analysis framework
                                </h3>
                            </header>
                        </>
                    )}
                    mainContentClassName={styles.main}
                    mainContent={(
                        <>
                            { pending && <LoadingAnimation /> }
                            <QuestionList
                                className={styles.questionList}
                                heading={framework.title}
                                framework={framework}
                            />
                            <div className={styles.rightPanel}>
                                <header className={styles.header}>
                                    <h3 className={styles.heading}>
                                        Diagnostics
                                    </h3>
                                </header>
                            </div>
                        </>
                    )}
                    headerClassName={styles.header}
                    header={(
                        <>
                            <BackLink
                                className={styles.backLink}
                                defaultLink={reverseRoute(pathNames.homeScreen, {})}
                            />
                            <h2 className={styles.heading}>
                                Framework questions
                            </h2>
                        </>
                    )}
                />
            </>
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(
        RequestClient(requestOptions)(
            FrameworkQuestions,
        ),
    ),
);
