#! /bin/bash

# Clone react-store if necessary
if [ -d "src/vendor/react-store" ]; then
    echo "Skipping react-store (already cloned)"
else
    echo "Cloning react-store to src/vendor/react-store"
    git clone git@github.com:toggle-corp/react-store.git src/vendor/react-store
fi

# Clone ravl if necessary
if [ -d "src/vendor/ravl" ]; then
    echo "Skipping ravl (already cloned)"
else
    echo "Cloning ravl to src/vendor/ravl"
    git clone git@github.com:toggle-corp/ravl.git src/vendor/ravl
fi

# Clone react-components if necessary
if [ -d "src/vendor/react-components" ]; then
    echo "Skipping react-components (already cloned)"
else
    echo "Cloning react-components to src/vendor/react-components"
    git clone git@github.com:timilsinabishal/react-components.git src/vendor/react-components
fi
