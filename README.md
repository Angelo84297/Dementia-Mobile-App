# Dementia-Mobile-App


the Azure Function app requires Azurite to be run locally. 

Azurite is used as local Azure storage emulator as the function app needs the following setting:    "AzureWebJobsStorage": "UseDevelopmentStorage=true"

After installing node.js run the following command in the terminal
npm install -g azurite