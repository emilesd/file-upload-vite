import { useState, useEffect } from 'react'
import axios from 'axios'
import Dropdown from './Dropdown'
import './App.css'

const App = () => {
  // This is the airtable table URI and the access token for this table
  const airtableApiUrl = "https://api.airtable.com/v0/appEfchjBao1aqPzV/tbldSSN6boaWoHjEL"
  const token = "patNv60QicEg7j2xQ.0febebed4ce5e961b9bd33bca01fec98e0b5295ce81fcf3be091c29297c78c01"

  // This is the API endpoint base URL
  const apiUrl = 'https://proxy.cors.sh/' + "http://18.119.84.34";

  const [partitionNames, setPartitionNames] = useState([])
  const [appState, setAppState] = useState("partition")
  const [inputObject, setInputObject] = useState({
    partitionName: '',
    query: '',
    file:'',
    budget: '',
  })
  const [queryResults, setQueryResults] = useState('')
  const [apiResponseMessage, setApiResponseMessage] = useState('')

  // On load, get all of the partition names from the airtable
  useEffect(() => {
    fetchListFromAirtable()
  }, [])

  const fetchListFromAirtable = () => {
    fetch(airtableApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => res.json()).then(data => {
      const partitionNamesList = data.records.map(record => record.fields.PartitionName)
      setPartitionNames(partitionNamesList)
    })
  }

  // Handler for updating input fields
  const handleChange = (event, key) => {
      const newInputObject = { ...inputObject, [key]: event.target.value }
      setInputObject(newInputObject)
  }

  // Update the state of the app based on selected values from dropdown
  const handleDropdownSelection = (newPartitionNameValue) => {
    const newInputObject = { ...inputObject, "partitionName": newPartitionNameValue }
    setInputObject(newInputObject)
  }

  // Handle uploading of the file
  const uploadFile = (e) => {
    let file = e.target.files[0];
    const newInputObject = { ...inputObject, "file": file }
    setInputObject(newInputObject)
  }

  // API call to airtable to add the partition to our list
  const addPartition = () => {
    // If the partition already exists in Airtable, don't add it again
    if (partitionNames.filter(p => p === inputObject.partitionName).length === 0) {
      const payload = {
        "fields": {
          "PartitionName": inputObject.partitionName
        }
      }
      fetch(airtableApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    }
  }

  // Put request to /document with the partition name and content
  const putFile = () => {
    const url = `${apiUrl}/document`
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const partitionName = `${inputObject.partitionName}:${inputObject.file.name}`
      const data = {
        "content": content,
        "partition_name": partitionName
      }
      const config = {
        'x-cors-api-key': 'temp_03b43894fcae11b27ce3052e4ede4a61'
      }
      axios.put(url, data, config)
      .then(res => {
        console.log("sdlkfjlksdjfksjdfklj")
        apiResponseMessage("Successfully uploaded file.")
        fetchListFromAirtable()
        addPartition()
      })
      .catch(err => setApiResponseMessage(err))
    }
    reader.readAsText(inputObject.file);
  }

  // API call to the /context endpoint
  const queryContext = () => {
    const url = `${apiUrl}/context?query=${inputObject.query}&partition_name=${inputObject.partitionName}${inputObject.budget.length ? `&max_context_tokens=${inputObject.budget}` : ''}`
    axios.get(url).then(res => setQueryResults(res.data.context))
  }

  return (
      <div className="h-screen flex items-center justify-center bg-indigo-600">
          <div className="w-96 p-6 shadow-lg bg-white rounded-md">
              <div className="flex justify-between border-indigo-900">
                <button className={`${appState === 'partition' ? 'bg-indigo-600 text-white py-1 w-full rounded-md' : ''} text-3xl block text-center font-semibold w-1/2`} onClick={() => setAppState("partition")}>Upload</button>
                <button className={`${appState === 'query' ? 'bg-indigo-600 text-white py-1 w-full rounded-md' : ''} text-3xl block text-center font-semibold w-1/2`} onClick={() => setAppState("query")}>Query</button>
              </div>
              <hr className="mt-3" />
              {appState == 'partition' && 
                <>
                  <div className="mt-3">
                      <label className="block text-base mb-2">Enter a partition name. Or choose one from the dropdown.</label>
                      <input className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 rounded-md" placeholder="Enter name" value={inputObject.partitionName} onChange={e => handleChange(e, "partitionName")} />
                  </div>
                  <Dropdown className="mt-3" partitionList={partitionNames} handleDropdownSelection={handleDropdownSelection}/>
                  <div className="mt-3">
                      <label className="block text-base mb-2">Choose a file</label>
                      <div className="mt-3 flex">
                          <input 
                            type="file" 
                            className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 rounded-md" 
                            placeholder="Upload file" 
                            value={inputObject.password} 
                            onChange={e => uploadFile(e)} 
                          />
                      </div>
                  </div>
                  <button 
                    className="mt-3 border-2 border-indigo-700 bg-indigo-700 text-white py-1 w-full rounded-md hover:bg-transparent hover:text-indigo-700 font-semibold"
                    onClick={putFile}
                  >
                    Upload
                  </button>
                </>
              }
              {appState == 'query' &&
                <>
                  <div className="mt-3">
                      <label className="block text-base mb-2">Enter a partition name. Or choose one from the dropdown.</label>
                      <input className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 rounded-md" placeholder="Enter name" value={inputObject.partitionName} onChange={e => handleChange(e, "partitionName")} />
                  </div>
                  <Dropdown className="mt-3" partitionList={partitionNames} handleDropdownSelection={handleDropdownSelection}/>
                  <div className="mt-3">
                      <label className="block text-base mb-2">Enter a query.</label>
                      <div className="mt-3 flex">
                          <input className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 rounded-md" placeholder="Enter query" value={inputObject.query} onChange={e => handleChange(e, "query")} />
                      </div>
                  </div>
                  <div className="mt-3">
                      <label className="block text-base mb-2">Enter a budget.</label>
                      <div className="mt-3 flex">
                          <input className="border w-full text-base px-2 py-1 focus:outline-none focus:ring-0 focus:border-gray-600 rounded-md" placeholder="Enter budget" value={inputObject.budget} onChange={e => handleChange(e, "budget")} />
                      </div>
                  </div>
                  <button className="mt-3 border-2 border-indigo-700 bg-indigo-700 text-white py-1 w-full rounded-md hover:bg-transparent hover:text-indigo-700 font-semibold" onClick={queryContext}>Query</button>
                  {queryResults.length > 0 && <div>{queryResults}</div>}
                  {apiResponseMessage.length > 0 && <div>{apiResponseMessage}</div>}
                </>
              }
          </div>
      </div>
  )
}

export default App
