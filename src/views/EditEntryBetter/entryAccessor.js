const entryAccessor = {
    localData: (entry = {}) => entry.localData,
    serverData: (entry = {}) => entry.serverData,
    data: (entry = {}) => entry.data,

    key: (entry = {}) => (entry.localData || {}).id,
    error: (entry = {}) => (entry.localData || {}).error,
};

export default entryAccessor;

