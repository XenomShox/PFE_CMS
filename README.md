# PFE_CMS
## Admin DashBoard
### How To install an app front end:
    1.  Create an ejs file with content class in it as main div
    2.  Add inside that div attribute "loading-script" and add the script for this app in it
    3.  Add inside that div attribute "loading-script" and add the script for this app in it
### Schema
#### GET:
    200: you get the result of the Schema "Name" Requested as a json body with Name and Schema.
    404: Error Msg inside "Error" Schema not Found.
    500: an unexpected condition was encountered & msg inside "Error".
#### POST:
    201: Schema have been created and a msg have been sent inside "SUCCESS"
    400: Invalid Schema & msg sent in "Error".
    409: cannot create Schema because Name already exist & msg inside "Error".
    500: an unexpected condition was encountered & msg inside "Error".
#### PUT:(Update)
    201: Schema has been updated and a msg have been sent inside "SUCCESS".
    400: Invalid Schema & msg sent in "Error".
    404: Couldn't find the Schema to change it with the new one & msg inside "Error".
    409: cannot create Schema because Name already exist & msg inside "Error".
    500: an unexpected condition was encountered & msg inside "Error".
#### DELETE:
    202: Schema has been deleted and a msg have been sent inside "SUCCESS".
    404: Couldn't find the Schema to Delete it & msg inside "Error".
    500: an unexpected condition was encountered & msg inside "Error".
