# Proxy Server

Nginx proxy server configuration for development on nightly server.

- Proper environment variables must also be set to connect to nightly server.
    ```
    REACT_APP_ADMIN_END=deep-server
    REACT_APP_API_END=deep-server
    REACT_APP_API_HTTPS=http

    REACT_APP_SERVERLESS_DOMAIN=http://deep-serverless

    DJANGO_SECRET_KEY=<the-secret-key-which-you-may-not-need>
    ```

- Add `server_name` from nginx.conf on `/etc/hosts`.
    ```
    127.0.0.1 deep-server
    127.0.0.1 deep-serverless
    ```
