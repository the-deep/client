#! /bin/bash

# Clone react-store if necessary
if [ -d "src/vendor/react-store" ]; then
    echo "Skipping react-store (already cloned)"
else
    echo "Cloning react-store to src/vendor/react-store"
    git clone git@github.com:toggle-corp/react-store.git src/vendor/react-store
fi

# Clone re-map if necessary
if [ -d "src/vendor/re-map" ]; then
    echo "Skipping re-map (already cloned)"
else
    echo "Cloning re-map to src/vendor/re-map"
    git clone git@github.com:toggle-corp/re-map.git src/vendor/re-map
fi
