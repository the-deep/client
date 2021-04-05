#! /bin/bash

# Clone react-store if necessary
if [ -d "src/vendor/react-store" ]; then
    echo "Skipping react-store (already cloned)"
else
    ssh -T git@github.com
    ssh_error_code=$?
    echo "Cloning react-store to src/vendor/react-store"
    clone_url='git@github.com:toggle-corp/react-store.git'
    if [ $ssh_error_code -eq 255 ]; then
        clone_url='https://github.com/toggle-corp/react-store.git'
    fi
    git clone $clone_url src/vendor/react-store
fi
