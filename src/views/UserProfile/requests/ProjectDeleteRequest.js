import { FgRestBuilder } from '#rs/utils/rest';
import {
    createUrlForProject,
    createParamsForProjectDelete,
} from '#rest';
import notify from '#notify';
import _ts from '#ts';

export default class ProjectDeleteRequest {
    constructor(props) {
        this.props = props;
    }

    create = ({ projectId, userId }) => {
        const urlForProject = createUrlForProject(projectId);

        const projectDeleteRequest = new FgRestBuilder()
            .url(urlForProject)
            .params(() => createParamsForProjectDelete())
            .success(() => {
                try {
                    this.props.unSetProject({
                        userId,
                        projectId,
                    });
                    notify.send({
                        title: _ts('userProfile', 'userProjectDelete'),
                        type: notify.type.SUCCESS,
                        message: _ts('userProfile', 'userProjectDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .preLoad(() => {
                this.props.setState({ deletePending: true });
            })
            .postLoad(() => {
                this.props.setState({ deletePending: false });
            })
            .failure(() => {
                notify.send({
                    title: _ts('userProfile', 'userProjectDelete'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'userProjectDeleteFailure'),
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('userProfile', 'userProjectDelete'),
                    type: notify.type.ERROR,
                    message: _ts('userProfile', 'userProjectDeleteFatal'),
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return projectDeleteRequest;
    }
}
