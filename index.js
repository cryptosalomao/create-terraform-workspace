const core = require('@actions/core');
const axios = require('axios');

try{
    const workSpaceName = core.getInput('workSpaceName');
    const organizationName = core.getInput('organizationName');
    const token = core.getInput('terraformToken');
    const terraformHost = core.getInput('terraformHost');

    const awsAccessKeyId = core.getInput('awsAccessKeyId');
    const awsSecretAccessKey = core.getInput('awsSecretAccessKey');

    const setAccessKeyRequest = { data: { type: "vars", attributes: { key: "AWS_ACCESS_KEY_ID", value: awsAccessKeyId, category: "env", sensitive: true } } }
    const setSecretAccessKeyRequest = { data: { type: "vars", attributes: { key: "AWS_SECRET_ACCESS_KEY", value: awsSecretAccessKey, category: "env", sensitive: true } } }

    let request = { data : { attributes: { name : workSpaceName, type: "workspaces"}}};
    console.log("request:" + JSON.stringify(request));

    const terraformEndpoint = "https://"+terraformHost+"/api/v2/organizations/"+organizationName+"/workspaces";
    const options = {
        headers: {'Content-Type': 'application/vnd.api+json',
                  'Authorization': 'Bearer '+token
                }       
    };
   // Invoking Terraform API
    axios.post(terraformEndpoint, request, options)
      .then(async (response) => {
        console.log("success:"+ JSON.stringify(response.data));

        await axios.post(`${terraformEndpoint}/${response.data.data.id}/vars`, setAccessKeyRequest, options)
        await axios.post(`${terraformEndpoint}/${response.data.data.id}/vars`, setSecretAccessKeyRequest, options)

        core.setOutput("workSpaceId", response.data.data.id);
      }, (error) => {
        console.error("error:"+JSON.stringify(error.response.data));
        core.setFailed(error.message);
      });

} catch(error){
    core.setFailed(error.message);
}