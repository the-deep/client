import React from 'react';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import {
    Modal,
} from '@the-deep/deep-ui';

import {
    AppState,
} from '#typings';
import {
    activeProjectRoleSelector,
    activeProjectIdFromStateSelector,
} from '#redux';

import ExportSelection from './ExportSelection';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    projectRole: activeProjectRoleSelector(state),
    activeProject: activeProjectIdFromStateSelector(state),
});

interface Permissions { // NOTE: mabe a global type for Permissions, ProjectRole can be used
    'create_only_unprotected'?: boolean;
    view?: boolean;
}

interface ProjectRole {
    assessmentPermissions?: Permissions;
    exportPermissions?: Permissions;
}

interface Props {
    className?: string;
    projectRole: ProjectRole;
    activeProject: number;
    onClose: () => void;
}

function NewExport(props: Props) {
    const {
        className,
        activeProject,
        projectRole,
        onClose,
    } = props;

    return (
        <Modal
            className={_cs(className, styles.newExportModal)}
            heading="Setup new export file"
            onCloseButtonClick={onClose}
            bodyClassName={styles.body}
        >
            <ExportSelection
                className={styles.exportSelection}
                projectRole={projectRole}
                projectId={activeProject}
            />
        </Modal>
    );
}

export default connect(mapStateToProps)(NewExport);
