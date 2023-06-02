FROM node:12
RUN echo "deb http://deb.debian.org/debian jessie main\ndeb http://security.debian.org jessie/updates main" > /etc/apt/sources.list

RUN curl -o- -L https://yarnpkg.com/install.sh | bash && \
  apt-get update && \
  apt-get -qy install --no-install-recommends netcat tree wget && \
  apt-get install -yq libgconf-2-4 && \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install -y google-chrome-unstable --no-install-recommends && \
  apt-get install -y build-essential && apt-get install -y python && \
  apt-get -y autoremove && \
  apt-get -y clean && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /tmp/* && \
  npm install -g nodemon

RUN  apt-get update \
     && apt-get install -y wget gnupg ca-certificates \
     # We install Chrome to get all the OS level dependencies, but Chrome itself
     && rm -rf /var/lib/apt/lists/* \
     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
     && chmod +x /usr/sbin/wait-for-it.sh

WORKDIR /app

# RUN mkdir -p /app
# RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#   && mkdir -p /home/pptruser/Downloads \
#   && chown -R pptruser:pptruser /home/pptruser \
#   && chown -R pptruser:pptruser /app

COPY package.json yarn.lock /app/
RUN yarn
RUN npm rebuild bcrypt --build-from-source
