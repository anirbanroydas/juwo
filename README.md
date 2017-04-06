# juwo

A full fledged web app (news feed, notifications, livestreaming, IRC, private instant messaging[rabbitmq], etc...) used as an experiment for every new technology using primarily Nodejs.

## Documentation


**Link :** http://juwo.readthedocs.io/en/latest/


## Project Home Page

**Link :** https://github.com/anirbanroydas/juwo


## Details


- **Author:** Anirban Roy Das
- **Email:** anirban.nick@gmail.com
- **Copyright(C):** 2017, Anirban Roy Das <anirban.nick@gmail.com>

Check  ` ci-testing-python/LICENSE  ` file for full Copyright notice.



## Overview

Its a full fledged web app which consists of **instant messaging** both public and private, **news feed**, **tweet-like** feature, **notifications**, **livestream of activities** and a **web interface** to view and use the application.

**NOTE:** This is a smaple project still in progress.

This project was made with the intention of using **NodeJs** and **Koa** framework to experiment with.

This project also experiments with many web technologies and present day social features like **news feed**, **posts** (like **twitter's tweets), **notifications**, **livestream of activities** (like **facebook's tickr**), **material design**.

This project uses many computer science enginnering tools and tries to solve experiment with problems like what are the methods to show  live stream of activities, how to store and show news feed, the engineering problems that come across to solve these problems and many more. All in all, this project is a very good smaple project to learn many new technologies and solve good computer science problems. Its also good for **system design** and also who want to start off with **nodejs** and **koa**.

It uses **gulp** as the task runner with intentions to move to **webpack**. presently the web interface is primarily usign **bootstrap** and plain **html5** along with **css3** but plans to move to **react** with **redux**.



## Technical Specs

- **Javascript:** Primary Language
- **Node 7:** The runtime engine
- **Koa 1.x:** The web framework for nodejs, good alternative to express
- **Bootstrap:** The html-css framework for frontend
- **Redis:** The session and cache storage
- **MongoDB:** The main database
- **RabbitMQ:** The message broker and queue engine, also used in notifications, feeds, livestreaming events.
- **Travis-CI (Optional):** A hosted CI server free for open-source projecs 
- **Docker:** A containerization tool for better devops


## Features

- Web App 
- Instant Messaging
- News Feed
- Tweets like feature.
- Notifications
- Livestream of activities and events




## Installation

#### Prerequisite (Optional)

To safegurad secret and confidential data leakage via your git commits to public github repo, check `git-secrets`.

This `git secrets <https://github.com/awslabs/git-secrets>`_ project helps in preventing secrete leakage by mistake.

====================
#### Dependencies

1. Docker
2. Make (Makefile)

See, there are so many technologies used mentioned in the tech specs and yet the dependencies are just two. This is the power of Docker. 

====================
#### Install


* **Step 1 - Install Docker**

  Follow my another github project, where everything related to DevOps and scripts are mentioned along with setting up a development environemt to use Docker is mentioned.

    * **Project:** https://github.com/anirbanroydas/DevOps

    * Go to  ` setup  ` directory and follow the setup instructions for your own platform,  ` linux/macos `

* **Step 2 - Install Make**
        
        # (Mac Os)
        $ brew install automake

        # (Ubuntu)
        $ sudo apt-get update
        $ sudo apt-get install make

* **Step 3 - Install Dependencies**
  
  Install the following dependencies on your local development machine which will be used in various scripts.

  - **openssl**
  - **ssh-keygen**
  - **openssh**
  


## CI Setup


If you are using the project in a CI setup (like travis, jenkins), then, on every push to github, you can set up your travis build or jenkins pipeline. Travis will use the  ` .travis.yml  ` file and Jenkins will use the  ` Jenkinsfile  ` to do their jobs. Now, in case you are using Travis, then run the Travis specific setup commands and for Jenkins run the Jenkins specific setup commands first. You can also use both to compare between there performance.

The setup keys read the values from a  ` .env  ` file which has all the environment variables exported. But you will notice an example  ` env  ` file and not a  ` .env  ` file. Make sure to copy the  ` env  ` file to  ` .env  ` and **change/modify** the actual variables with your real values.

The  ` .env  ` files are not commited to git since they are mentioned in the  ` .gitignore  ` file to prevent any leakage of confidential data via **environment variables** liek ***api keys***, ***username/password***, ***secret-tokens***.

After you run the setup commands, you will be presented with a number of secure keys. Copy those to your config files before proceeding.

**NOTE:** This is a one time setup.

**NOTE:** Check the setup scripts inside the  ` scripts/  ` directory to understand what are the environment variables whose encrypted keys are provided.

**NOTE:** Don't forget to ***Copy*** the secure keys to your  ` .travis.yml  ` or  ` Jenkinsfile `

**NOTE:** If you don't want to do the copy of  ` env  ` to  ` .env  ` file and change the variable values in  ` .env  ` with your real values then you can just edit the  ` travis-setup.sh  ` or  ` jenknis-setup.sh  ` script and update the values their directly. The scripts are in the  ` scripts/  ` project level directory.


**IMPORTANT:** You have to run the  ` travis-setup.sh  ` script or the  ` jenkins-setup.sh  ` script on your ***local machine*** before deploying to ***remote server***.

==================== 

#### Travis Setup


These steps will encrypt your environment variables to secure your confidential data like api keys, docker based keys, deploy specific keys.

    $ make travis-setup


==================== 
#### Jenkins Setup

These steps will encrypt your environment variables to secure your confidential data like api keys, docker based keys, deploy specific keys.

    $ make jenkins-setup




## Usage

After having installed the above dependencies, and ran the **Optional** (If not using any CI Server) or **Required** (If using any CI Server) **CI Setup** Step, then just run the following commands to use it:


You can run and test the app in your local development machine or you can run and test directly in a remote machine. You can also run and test in a production environment. 


==================== 
#### Run

The below commands will start everythin in development environment. To start in a production environment, suffix  ` -prod  ` to every ***make*** command.

For example, if the normal command is  ` make start `, then for production environment, use  ` make start-prod `. Do this modification to each command you want to run in production environment. 

**Exceptions:** You cannot use the above method for test commands, test commands are same for every environment. Also the   ` make system-prune  ` command is standalone with no production specific variation (Remains same in all environments).

* **Start Applcation**

        $ make clean
        $ make build
        $ make start

        # OR

        $ docker-compose up -d


    
  
* **Stop Application**

        $ make stop

        # OR

        $ docker-compose stop


* **Remove and Clean Application**

        $ make clean

        # OR

        $ docker-compose rm --force -v
        $ echo "y" | docker system prune


* **Clean System**

        $ make system-prune

        # OR

        $ echo "y" | docker system prune



====================
#### Logging


* To check the whole application Logs

        $ make check-logs

        # OR

        $ docker-compose logs --follow --tail=10



* To check just the python app\'s logs

        $ make check-logs-app

        # OR

        $ docker-compose logs --follow --tail=10 identidock






Todo
-----

1. Add Blog post regarding this topic.
2. Add Tests.
