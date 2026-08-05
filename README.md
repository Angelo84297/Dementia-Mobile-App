# Dementia-Mobile-App


the Azure Function app requires Azurite to be run locally. 

Azurite is used as local Azure storage emulator as the function app needs the following setting: "AzureWebJobsStorage": "UseDevelopmentStorage=true"
Azurite needs to run before the function app when a timer trigger is used as it needs storage. 

to run Azurite type the following command in the terminal
azurite

After installing node.js run the following command in the terminal
npm install -g azurite

Run func start in the terminal to trigger the Azure function