import {once} from "node:events";

/**
 * Starts the app on a random free port.
 * @returns {Promise<{url: string, close: () => Promise<void>, post: Function}>}
 */
export async function startServer(app) {
    const server = app.listen(0);
    await once(server, "listening");
    const url = `http://127.0.0.1:${server.address().port}`;

    return {
        url,
        close: () => new Promise((resolve) => server.close(resolve)),
        post: (path, body, headers = {}) =>
            fetch(url + path, {
                method: "POST",
                headers: {"Content-Type": "application/json", ...headers},
                body: typeof body === "string" ? body : JSON.stringify(body),
            }),
    };
}
