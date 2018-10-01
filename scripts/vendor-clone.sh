#! /bin/bash

# Clone react-store if necessary
if [ -d "src/vendor/react-store" ]; then
    echo "Skipping react-store (already cloned)"
else
    echo "Cloning react-store to src/vendor/react-store"
    git clone git@github.com:toggle-corp/react-store.git src/vendor/react-store
fi

# Clone react-components if necessary
if [ -d "src/vendor/react-components" ]; then
    echo "Skipping react-components (already cloned)"
else
    echo "Cloning react-components to src/vendor/react-components"
    git clone git@github.com:timilsinabishal/react-components.git src/vendor/react-components
fi
