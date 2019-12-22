import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
} from '@togglecorp/fujs';

import DangerButton from '#rsca/Button/DangerButton';

import Page from '#rscv/Page';

import {
    AppState,
    AppProps,
    QuestionnaireItem,
} from '#typings';

import {
    RequestCoordinator,
    RequestClient,
} from '#request';

import {
    questionnaireSelector,
} from '#redux';

import BackLink from '#components/general/BackLink';
import { pathNames } from '#constants';
import { getMatrix2dStructures } from '#utils/framework';

import styles from './styles.scss';

interface PropsFromAppState {
    questionnaire: QuestionnaireItem;
}

interface OwnProps {
    className?: string;
}

type Props = PropsFromAppState & OwnProps;

const mapStateToProps = (state: AppState, props: AppProps) => ({
    questionnaire: questionnaireSelector(state, props),
});

const requests = {
    frameworkGetRequest: {
        url: ({ props: { questionnaire } }: { props: Props }) => `/analysis-frameworks/${questionnaire.frameworkId}`,
        onMount: true,
    },
};

class QuestionnaireBuilder extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            questionnaire,
            requests: {
                frameworkGetRequest: {
                    response: framework,
                } = {},
            } = {},
        } = this.props;

        console.warn(getMatrix2dStructures(framework));

        return (
            <Page
                className={_cs(styles.questionnaireBuilder, className)}
                mainContentClassName={styles.main}
                headerAboveSidebar
                sidebarClassName={styles.sidebar}
                sidebar={(
                    <>
                        <header className={styles.header}>
                            <h3 className={styles.heading}>
                                Analysis framework
                            </h3>
                        </header>
                        <div className={styles.content}>
                            <div className={styles.selectedAttributeList}>
                                <header className={styles.header}>
                                    <h4 className={styles.heading}>
                                        Selected
                                    </h4>
                                    <div className={styles.actions}>
                                        <DangerButton>
                                            Clear
                                        </DangerButton>
                                    </div>
                                </header>
                            </div>
                        </div>
                    </>
                )}
                mainContent={(
                    <>
                        Hmm
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
                            Questionnaire builder ({questionnaire.title})
                        </h2>
                    </>
                )}
            />
        );
    }
}

export default connect(mapStateToProps)(
    RequestCoordinator(
        RequestClient(requests)(
            QuestionnaireBuilder,
        ),
    ),
);
