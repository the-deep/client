import {
    languageServerEndPoint,
    createParamsForLanguageServer,
} from '#rest';

import _ts from '#ts';

import notify from '#notify';
import Request from '#utils/Request';

export default class DevLangSave extends Request {
    handlePreLoad = () => {
        this.parent.setState({ devLangSavePending: true });
    }

    handleAfterLoad = () => {
        this.parent.setState({ devLangSavePending: false });
    }

    handleSuccess = () => {
        this.parent.clearChanges();
        notify.send({
            title: _ts('stringManagement', 'devLangSaveTitle'),
            type: notify.type.SUCCESS,
            message: _ts('stringManagement', 'devLangSaveSuccessText'),
            duration: notify.duration.MEDIUM,
        });
    }

    handleFailure = ({ message }) => {
        notify.send({
            title: _ts('stringManagement', 'devLangSaveTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    handleFatal = ({ message }) => {
        notify.send({
            title: _ts('stringManagement', 'devLangSaveTitle'),
            type: notify.type.ERROR,
            message,
            duration: notify.duration.MEDIUM,
        });
    }

    init = (strings, links) => {
        this.createDefault({
            url: languageServerEndPoint,
            params: createParamsForLanguageServer({ strings, links }),
        });
    }
}
