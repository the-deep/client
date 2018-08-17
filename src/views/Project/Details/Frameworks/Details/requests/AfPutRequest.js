import {
    createUrlForAnalysisFramework,
    createParamsForAnalysisFrameworkEdit,
} from '#rest';
import Request from '#utils/Request';
import notify from '#notify';
import _ts from '#ts';

/*
 * Pulls all the Analysis Framework
 * Required:
 *  - setState
 *  - setFrameworkDetails
 */
export default class ProjectAfCloneRequest extends Request {
    schemaName = 'analysisFramework'

    handlePreLoad = () => {
        this.parent.setState({ pending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ pending: false });
    }

    handleSuccess = (response) => {
        this.parent.setFrameworkDetails({
            afId: this.afId,
            afDetail: response,
        });
        notify.send({
            title: _ts('project', 'afFormEdit'),
            type: notify.type.SUCCESS,
            message: _ts('project', 'afFormEditSuccess'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = () => {
        notify.send({
            title: _ts('project', 'afFormEdit'),
            type: notify.type.ERROR,
            message: _ts('project', 'afFormEditFailure'),
            duration: notify.duration.SLOW,
        });
    }

    handleFatal = () => {
        notify.send({
            title: _ts('project', 'afFormEdit'),
            type: notify.type.ERROR,
            message: _ts('project', 'afFormEditFatal'),
            duration: notify.duration.SLOW,
        });
    }

    init = (afId, values) => {
        this.afId = afId;

        this.createDefault({
            url: createUrlForAnalysisFramework(afId),
            params: createParamsForAnalysisFrameworkEdit(values),
        });
        return this;
    }
}
