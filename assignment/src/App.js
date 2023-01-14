
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from 'react';
import { Octokit } from "octokit";
function App() {
  //Constants
  //Max page size we can get from the API: https://docs.github.com/en/rest?apiVersion=2022-11-28
  const MAX_PAGE_SIZE = 100;

  //Exercise 1
  const [orgRepositories, setOrgRepositories] = useState("");
  const [orgName, setOrgName] = useState("");
  //Exercise 2
  const [orgName2, setOrgName2] = useState("");
  const [url, setUrl] = useState("");
  const [repoSize, setRepoSize] = useState("");

  //Exercise 3
  const [organizationNumber, setOrganizationNumber] = useState("");

  //Input handlers
  const handleInputChange = (e) => {
    setOrgName(e.target.value);
  }

  const handleInputChange2 = (e) => {
    setOrgName2(e.target.value);
  }

  //Github API token
  //In a real word application you would hide this token in a .dev file
  //I left this here so the person who uses the code it will be easier for him
  const octokit = new Octokit({
    auth: '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'
  });

  //personal token: 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
  //Calcules the number of repositories of the organization sent by the front end.
  //Makes as many API calls as there is data left to fetch(dataFetched) and stores in totalData
  async function calculateRepositories() {
    try {
      let result = await octokit.request("GET /orgs/{org}/repos", {
        org: orgName,
        per_page: MAX_PAGE_SIZE,
        page: 1
      });
      let dataFetched = result.data.length;
      let totalData = dataFetched;
      //After the first page we called,we continue from the second one and we iterate while there is data left with (i)
      let i = 2;
      while (dataFetched !== 0) {
        result = await octokit.request("GET /orgs/{org}/repos", {
          org: orgName,
          per_page: MAX_PAGE_SIZE,
          page: i,
        });
        i++;
        dataFetched = result.data.length;
        totalData = totalData + dataFetched;


      }
      setOrgRepositories(totalData);
    } catch (error) {
      alert("This organization does not exist");
    }


  }

  //Calcules the biggest repository in bytes of an organization
  //It is very similar to the previous one but this one iterates through every repository to search the one 
  //with biggest size (result.data[i].size)
  async function calculateBiggestRepository() {
    try {
      let result = await octokit.request("GET /orgs/{org}/repos", {
        org: orgName2,
        per_page: MAX_PAGE_SIZE,
        page: 1
      });

      let dataSize = 0;
      let url = "";
      let dataFetched = result.data.length;

      //We iterate through every element of the data array and we keep the one with biggest size
      for (let x = 0; x < dataFetched; x++) {
        if (result.data[x].size > dataSize) {
          dataSize = result.data[x].size;
          url = result.data[x].url;
        }
      }

      let i = 2;

      //While is there data left we do the same for the next pages as this API we can only retrieve 100 elements per page
      while (dataFetched !== 0) {
        result = await octokit.request("GET /orgs/{org}/repos", {
          org: orgName2,
          per_page: MAX_PAGE_SIZE,
          page: i,
        });
        dataFetched = result.data.length;
        for (let x = 0; x < dataFetched; x++) {
          if (result.data[x].size > dataSize) {
            dataSize = result.data[x].size;
            url = result.data[x].url;
          }
        }
        i++;
      }

      setRepoSize(dataSize);
      setUrl(url);
    } catch (error) {
      alert("This organization does not exist");
    }
  }


  //Returns the number of organizations that are currently on Github
  //With Github REST Api v3 there is not a direct way to retrieve all the organizations that are currently on Github
  //We can do with https://docs.github.com/en/rest/orgs/orgs?apiVersion=2022-11-28#list-organizations list organizations ordered by id
  //ascending and with one API call we get the first 100 organizations. In Github there are more than 110.000.000 ids with many of them being
  //organizations. This is way this method is so slow (probably it will take more than 1 hour) because it has to iterate through every organization.

  //The since parameter is used to start reading the first 100 organizations from that id so the code is optimized that it takes the id from the last organization
  //and in the next api call it starts searching from that id
  async function calculateNumberOfOrganizations() {
    let result = await octokit.request('GET /organizations{?since,per_page}', {
      per_page: MAX_PAGE_SIZE,
      since: 1
    });

    let dataFetched = result.data.length;
    let totalData = dataFetched;
    let i = result.data[dataFetched - 1].id;
    while (dataFetched !== 0) {
      result = await octokit.request('GET /organizations{?since,per_page}', {
        per_page: MAX_PAGE_SIZE,
        since: i
      });
      i = result.data[dataFetched - 1].id;
      dataFetched = result.data.length;
      totalData = totalData + dataFetched;
    }

    setOrganizationNumber(totalData);
  }


  return (
    <div className="App">
      <div className='container '>
        <div className='col-8 mx-auto' >
          <div className='row justify-content-center'>
            <form>
              <div className="row pt-5">
                <p>1. Given an organization return the number of repositories.</p>

                <div className="col">
                  <input type="text" className="form-control" placeholder="Organization" onChange={handleInputChange} />
                </div>
                <div className="col">
                  <button type="button" className="btn btn-primary" onClick={calculateRepositories}>Search</button>
                </div>
                <div className="row pt-2">
                  <p>Response: {orgRepositories}</p>
                </div>
              </div>
            </form>
          </div>
          <div className='row justify-content-center'>
            <form>
              <div className="row pt-5">
                <p>2. Given an organization return the biggest repository (in bytes). </p>
                <div className="col">
                  <input type="text" className="form-control" placeholder="Organization" onChange={handleInputChange2} />
                </div>
                <div className="col">
                  <button type="button" className="btn btn-primary" onClick={calculateBiggestRepository}>Search</button>
                </div>
                <div className="row pt-2">
                  <p>Repository url: {url}</p>
                  <p>Repository size: {repoSize} bytes</p>
                </div>
              </div>
            </form>
          </div>

          <div className='row justify-content-center'>
            <form>
              <div className="row pt-5">
                <p>3. Return the number of organizations that are currently on Github.  </p>
                <div><button type="button" className="btn btn-primary" onClick={calculateNumberOfOrganizations}>Search</button></div>
                <div className="row pt-2">
                  <p>Response: {organizationNumber} </p>

                </div>
              </div>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;
