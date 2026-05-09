import EnvironmentVariables from "./EnvironmentVariables";
import HttpClient from "./HttpClient";
import PathParameters from "./PathParameters";
import QueryParameters from "./QueryParameters";
import WorkingWithArrays from "./WorkingWithArrays";
import WorkingWithArraysAsynchronously from "./WorkingWithArraysAsynchronously";
import WorkingWithObjects from "./WorkingWithObjects";
import WorkingWithObjectsAsynchronously from "./WorkingWithObjectsAsynchronously";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
export default function Lab5() {
    return (
        <div id="wd-lab5">
            <h3>Lab 5: Implementing RESTful web APIs wiht Express.js</h3>
            <div className="list-group">
                <a href={`${HTTP_SERVER}/lab5/welcome`} className="list-group-item">
                    Welcome
                </a>
            </div>
            <hr/>
            <EnvironmentVariables />
            <hr />
            <PathParameters />
            <hr />
            <QueryParameters />
            <hr />
            <WorkingWithObjects />
            <hr />
            <WorkingWithArrays />
            <hr />
            <HttpClient />
            <hr />
            <WorkingWithObjectsAsynchronously />
            <hr />
            <WorkingWithArraysAsynchronously />
        </div>
);}