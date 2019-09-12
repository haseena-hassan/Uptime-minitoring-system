# Uptime-minitoring-system

This application allows the users to enter URLs they want monitored, and receive alerts when those resources go down or come back up.

# Functionalities

* User signup, signin, sign-out
* users edit the settings
* sending sms alerts to user instead of emails

# Requirements

* A RESTful API that
    ** listens to a PORT
    ** accepts incoming HTTP request for POST, GET, PUT, DELETE and HEAD.

* The API allows a client to connect so that
    ** create a new user
    ** edit user
    ** delete the user

* The API allows user to sign in
    ** this gives them a token that they can use for subsequent authenticated requests

* The API allows the user to sign out
    ** this invalidates their token

* The API allows the signed-in user to create a new "check"
    ** check means a task for the system to check a given URL to see if its "up" od "down"
    ** also want the user to find what "up" or "down" is

* The API allows a signed in user to edit or delete any of their checks
    ** want to limit their checks to 5

* In the backgrnd, the checks need to be performed at appropriate times
    ** alert the user when a check changes its state from up to down or vice-versa
    ** the checks are run once a minute

* The sms are sent via the messagind app Twilio

* For this app, Im using the file-system as a key-value store of JSON docs. In real app we need a DB.
