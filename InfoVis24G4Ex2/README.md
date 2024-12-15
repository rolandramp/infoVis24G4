# Assignment 2

## Setup

Create docker image with node.js already installed

`docker pull node`

`docker run -it -v "c:\Users\rolan\Informationsvisualisierung Ex1":/data -p 3434:8080 0b50ca11d81b /bin/bash`

`cd ~`

`npm install`

`npm start`

with Ctlr + P + Q the container can be left an the service is running on.

with `docker attach <container_id>` the container can be entered again.

Template used from [D3-App-Template](https://github.com/domoritz/D3-App-Template/blob/main/package.json)

