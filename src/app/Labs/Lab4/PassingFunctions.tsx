export default function PassingFunctions(
    { theFunction }: { theFunction: () => void }) {
return (
    <div>
        <h3>Passing Functions</h3>
        <button onClick={theFunction} className="btn btn-primary">
            Invoke the Function
        </button>
        <hr/>
    </div>
);}