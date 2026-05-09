import { useState } from "react";

export default function ArrayStateVariable() {
    const [array, setArray] = useState([1, 2, 3, 4, 5]);
    
    const addElement = () => {
        setArray([...array, Math.floor(Math.random() * 100)]);
    };
    
    const deleteElement = (index: number) => {
        setArray(array.filter((item, i) => i !== index));
    };
    
    return (
        <div id="wd-array-state-variables">
            <h2>Array State Variable</h2>
            <button onClick={addElement} className="btn btn-success mb-3">
                Add Element
            </button>
            
            <div className="border rounded" style={{ maxWidth: '300px' }}>
                <ul className="list-unstyled mb-0">
                    {array.map((item, index) => (
                        <li 
                            key={index} 
                            className={`d-flex justify-content-between align-items-center px-3 ${
                                index !== array.length - 1 ? 'border-bottom' : ''
                            }`}
                            style={{ padding: '8px 16px' }}
                        >
                            <span>{item}</span>
                            <button onClick={() => deleteElement(index)} className="btn btn-danger">
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <hr/>
        </div>
    );
}