#CSV Parser

##Allows for easy import of CSV file
Look at uploadcsv.js in routes it will show how the file is read and will also allow for modification of what is read into the database. 

##Allows for quick views of CSV file and downloads
All views of the CSV files will be able to be shown on the main index page.

##Format for csv files:
The first six indexes of the file must be as follows:
 * ID, Study, Group, Ethnicity, Gender, Condition

In order for certain markers to be recognized by the application, the CSV headers must follow a specific format:
 * Condition is recognized by finding any header that begins with "Condition". For each person added to the database, it will define their condition as the first one that appears within the relevent section. 
 * A relevent section is defined as a block within the CSV file where all people have the same study and group but also have values defined that no other study/group also has defined
 * Essays are recognized either by having their header starting with either "EQ" or "ESSAY". The program will then record all essays with the corresponding header and their intervention.
 * Each intervention is constantly updated as the most recently defined intervention value. An intervention must be labeled with the tag "INTERVENTION" in order for it to be recognized by similarly placing it at the front of the header. 
 * Grades can also be recognized by placing "MARK" at the beginning of the header where a grade is relevent. 
 * File paths are also recognized by adding "FILE PATH" to the beginning of the header with file path. 

##Running the server
 * First call the script RunMeBeforeStart.sh. It assumes that you have already installed node.js on your system, which can be installed by running the command "sudo apt-get install" on linux, however you are welcome to look up the relevent instructions for your environment
 * Run the script StartServer.sh on a linux machine. This will call the command nohup, which runs the server in the background. This allows it to be publicly available on a linux server with forwarding enabled. 
 * Run the script KillServer.sh to automatically kill the running instance of the app. Otherwise, you are welcome to try to find the pid of the command that was running. 