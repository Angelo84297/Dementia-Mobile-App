# AI-Assisted Dementia Wellbeing Mobile Application
A Wellbeing application providing everyday assistance for people living with Dementia. 

# Features
- Mood tracker
- Health tracker (sleep duration,average heart rate, total step count)
- AI Wellbeing advice
- Task Manager
- Weekly and daily local reminders

## Requirements 

### Frontend
- Node.js
- npm 
- Expo SDK 54
- A smartphone with Expo go installed

### Backend 
- Python 3.14.3
- pip 
- Python dependencies described in 'backend/requirements.txt' 
- MySQL

### Azure 
- Azurite
- Node.js

## Installation 

### Frontend 
From the frontend directory run the following command to install dependencies: npm install 
To start the development server run the following command: npx expo start
Create an .env file following the provided .env.example. 
Set EXPO_PUBLIC_API_URL to the local IP address as in http://YOUR_LOCAL_IP:8000

### Backend 
Activate the virtual environment and run this command to install the requirements: pip install -r requirements.txt
Open the .env file and configure the database_url with the credentials for your local database
To test FastAPI directly run: uvicorn main:app --reload   
When using a physical smartphone for testig run uvicorn main:app --host 0.0.0.0 --port 8000 --reload to allow the smarphone to connect to the backend. 

### Azure Function
Install the "Azure Functions" extension on VS Code. 
Run the following command to install Azurite: npm install -g azurite
From the functions directory open local.settings.json and ensure the associated value of "AzureWebJobsStorage" is "UseDevelopmentStorage=true". 
From the same file adjust the database values for your local database. 
The Azure Function app requires Azurite to be run to work correctly since timer triggers were used.
To run Azurite type the following command in the terminal: azurite
Run the following command in the terminal to start the Azure functions: func start 

### MySQL 
Once connection is estabilished between fastAPI and the database, FastAPI automatically creates all the tables. 
Run the script in 'backend/001_inserted_mockup_data.sql' to initialise values for the patient. 

## Running the applicaiton
Follow this order when running the application: 
- Synchronise your wearable with Google Health API. 
- Run Azurite. 
- Run the Azure function to fetch the health data from the Google Health API. 
- Run FastAPI 
- Run the Front End
                                           
## Testing 
For React Native run the following command in the terminal: npm test
For the Backend run the following command in the terminal: pytest