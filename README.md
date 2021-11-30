### how to run assessment registry 
1. Deploy the branch https://github.com/the-deep/client/tree/feature/only-ary
2. Update REACT_APP_ASSESSMENT_REGISTRY_END env to the deployed endpoint

If you want to run assessment registry in local environment
1. Copy all the code from (https://github.com/the-deep/client/tree/feature/only-ary) to a client_old folder under [deeper](https://github.com/the-deep/deeper) root directory
2.  Update docker-compose.yml 
```
  client_old:
      image: thedeep/deep-client:latest-old
      build:
        context: ./client_old/
        cache_from:
          - thedeep/deep-client:latest
      tty: true
      env_file:
        - .env
      command: bash -c '/code/scripts/run_develop.sh'
      volumes:
        - ./client_old/:/code
      ports:
        - '3100:3000'
```
3. Update REACT_APP_ASSESSMENT_REGISTRY_END `REACT_APP_ASSESSMENT_REGISTRY_END=http://localhost:3100` 
4. run `docker-compose up`
