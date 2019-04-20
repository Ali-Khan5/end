FROM ubuntu:16.04

RUN apt-get update

RUN apt-get install --yes curl
RUN apt-get update && apt-get install -y apt-transport-https
RUN curl --silent --location https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install --yes nodejs build-essential
RUN apt-get update && apt-get install -y xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps clang libdbus-1-dev libgtk2.0-dev libnotify-dev libgnome-keyring-dev libgconf2-dev libasound2-dev libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib

COPY . /src

RUN cd /src; npm install

CMD xvfb-run --server-args="-screen 0 1024x768x24" node /src/server.js