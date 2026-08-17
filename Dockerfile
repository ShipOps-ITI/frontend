FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


#before pushing for testing on minikube i used node port for now add vite auth url to frontend env before pushing
#echo "VITE_AUTH_URL=http://<minikube-ip>:30001" > .env
#docker build -t somaya189/frontend:v1 .
#docker push somaya189/frontend:v1

#access front end after running
#minikube service frontend -n shipops --url

