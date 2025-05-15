# Quota modes | Spotify for Developers

Announcement:**REMINDER : We are updating the criteria to be granted extended access to the Web API.**  
Submit your extended quota mode application by May 15th. For more information, read [here.](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)

# Quota modes

The quota mode refers to the mode in which an app can be: **development mode** or **extended quota mode**.

You can check the current mode of your app by checking the _App Status_ value in the _App Settings_:

![App status](https://developer-assets.spotifycdn.com/images/documentation/web-api/appstatus.png)

## Development mode

Newly-created apps begin in **development mode**. This mode is perfect for apps that are under construction and apps that have been built for accessing or managing data in a single Spotify account.

Up to 25 authenticated Spotify users can use an app that is in development mode — so you can share your app with beta testers, friends, or with fellow developers who are working on the app. Each Spotify user who installs your app will need to be added to your app's allowlist before they can use it.

### Adding a user to your app's allowlist

Allow another user to use your development mode app by following these steps:

1.  Log in to the [Developer Dashboard](/dashboard)
2.  Tap on the name of your app
3.  Tap on the _Settings_ button
4.  Tap on the _Users Management_ tab ![Users and Access](https://developer-assets.spotifycdn.com/images/documentation/web-api/users-and-access.png)
5.  Tap on the _Add new user_ button and enter the name and Spotify email address of the user that you want to enable to use your app
6.  Invite the new user to install and use your app

Users may be able to log into a development mode app without having been allowlisted by the developer. However, API requests with an access token associated to that user and app will receive a 403 status code error

## Extended quota mode

Extended quota mode is for Spotify apps that are ready for a wider audience. Apps in this category can be installed by an unlimited number of users and the allowlist in development mode no longer applies. Extended quota mode apps also have access to a higher [rate limit](/documentation/web-api/concepts/rate-limits) than development mode apps do.

### Moving from development mode into extended quota mode

You can ask Spotify to move your app from development mode into extended quota mode. Spotify's app review team will take a look at your app and evaluate it for compliance with our [Developer Policy](/policy).

1.  Log in to the [Developer Dashboard](/dashboard)
2.  Tap on the name of your app
3.  Tap on the _Settings_ button
4.  Tap on the _Quota extension Request_ tab ![Request Extension link](https://developer-assets.spotifycdn.com/images/documentation/web-api/request-a-quota-extension.png)
5.  Tell us about your app by filling out the provided questionnaire (4 steps)
6.  Tap Submit

When you have successfully submitted your app for review you should see the word 'Sent' in blue on your app detail page. The app review team will review the information that you have provided, test out your app and send you feedback by email, to the email address associated with your Spotify account. This review process can take up to six weeks.

## Changes to Extended Quota mode

We’re updating how we grant extended quota mode access to ensure we continue to invest our resources effectively while supporting use cases that are impactful and aligned with our platform strategy. Read more on our [blog post](/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access).

Starting **May 15, 2025**, extended Web API access will be reserved for apps with established, scalable, and impactful use cases that help drive our platform strategy forward and promote artists and creator discovery. Developers previously granted extended access and actively using the Web API in compliance with our [Developer Terms](/terms) will remain unaffected by this change.

The new criteria we will begin considering include the following:

-   Having an established business entity
-   Operating an active and launched service
-   Maintaining a minimum of active users (at least 250k MAUs)
-   Being available in key Spotify markets

Developers with new extension requests can submit their applications through the existing framework until May 15th, 2025, and we are committed to reviewing each one. After that date, new proposals will need to meet the new criteria and Developer Terms, and the application submission process will move to our [Web API page](/documentation/web-api).