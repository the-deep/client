import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { connect } from 'react-redux';

import {
    Container,
    List,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import { AppState } from '#typings';
import {
    activeProjectIdFromStateSelector,
    activeUserSelector,
} from '#redux';
import { FileUploadResponse } from '../types';
import SourceItem from './SourceItem';

import styles from './styles.scss';

const keySelector = (d: FileUploadResponse): number => d.id;

interface Props {
    className?: string;
    files: FileUploadResponse[];
    activeUser: { userId: number };
    activeProjectId: number;
}

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
    activeProjectId: activeProjectIdFromStateSelector(state),
});

function SourcesUploaded(props: Props) {
    const {
        className,
        activeUser,
        activeProjectId,
        files = [],
    } = props;

    const fileRendererParams = useCallback((_: number, data: FileUploadResponse) => ({
        data,
        activeUserId: activeUser.userId,
        activeProjectId,
    }), [activeProjectId, activeUser]);
    return (
        <div
            className={_cs(className, styles.sourcesUploadedDetails)}
        >
            <Container
                className={styles.sourcesContainer}
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                contentClassName={styles.sources}
                sub
            >
                <List
                    data={files}
                    renderer={SourceItem}
                    keySelector={keySelector}
                    rendererParams={fileRendererParams}
                />
            </Container>
        </div>
    );
}

export default connect(mapStateToProps)(SourcesUploaded);
