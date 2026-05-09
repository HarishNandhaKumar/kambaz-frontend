
export default function EnvironmentVariables() {
    const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
    return (
        <div id="wd-environment-variables">
            <h3>Environment Variables</h3>
            <p>Remote Server: {HTTP_SERVER}</p>
            <hr/>
        </div>
);}